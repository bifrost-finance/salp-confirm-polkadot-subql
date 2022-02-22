import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { TransferBatch, Contributed, ContributedBatch } from "../types";
import { Bytes, Compact } from "@polkadot/types";
import { SignedBlock, Balance } from "@polkadot/types/interfaces";
import type { ParaId } from '@polkadot/types/interfaces/parachains';
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { hexToU8a, isHex } from "@polkadot/util";


const BatchAllCallId = "26,2"; // 0x1a02
const ContributeCallId = "0x4901";
const ProxyCallId = "0x1d00";

function getSystemRemarkWithEventCallId(blockNumber: number): string {
  let SystemRemarkWithEventCallId = "0x0008";
  if (blockNumber < 8117655) {
    SystemRemarkWithEventCallId = "0x0009";
  } else {
    SystemRemarkWithEventCallId = "0x0008";
  }
  return SystemRemarkWithEventCallId
}

function isValidAddressPolkadotAddress(remark): string {
  try {
    const address = encodeAddress(
      isHex(remark)
        ? hexToU8a(remark)
        : decodeAddress(remark), 0
    );

    return address;
  } catch (error) {
    return null;
  }
};

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

export async function handleBatchCompleted(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();
  const SystemRemarkWithEventCallId = getSystemRemarkWithEventCallId(blockNumber);

  const tx = event.extrinsic ? event.extrinsic.extrinsic.method : undefined;
  if (tx !== undefined && tx.callIndex.toString() === BatchAllCallId) {
    let records = [];
    const args = JSON.parse(JSON.stringify(tx.args));
    args[0].forEach((value, index) => {
      if (index % 4 == 3
        && value.callIndex.toString() === SystemRemarkWithEventCallId
        && args[0][index - 3].callIndex.toString() === ProxyCallId
        && args[0][index - 2].callIndex.toString() === SystemRemarkWithEventCallId
        && args[0][index - 1].callIndex.toString() === SystemRemarkWithEventCallId
      ) {
        if (args[0][index - 3].args.call.callIndex.toString() === ContributeCallId) {
          const record = new ContributedBatch(blockNumber.toString() + '-' + event.idx.toString() + '-' + (index - 3).toString());
          record.block_height = blockNumber;
          record.block_hash = event.block.hash ? event.block.hash.toString() : null;
          record.event_id = event.idx;
          record.extrinsic_id = event.extrinsic ? event.extrinsic.idx : null;
          record.extrinsic_hash = event.extrinsic ? event.extrinsic.extrinsic.hash.toString() : null;
          record.block_timestamp = event.block.timestamp;
          record.paraId = parseInt(JSON.stringify(args[0][index - 3].args.call.args.index));
          record.balanceOf = BigInt(JSON.stringify(args[0][index - 3].args.call.args.value));
          record.transfer_event_id = hex_to_ascii((args[0][index - 2].args.remark as Bytes).toString().slice(2));
          record.account = hex_to_ascii((args[0][index - 1].args.remark as Bytes).toString().slice(2));
          let address = isValidAddressPolkadotAddress((value.args.remark as Bytes).toString())
          if (address !== null) {
            record.referrer = address;
          } else {
            record.referrer = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
          }
          records.push(record.save());
        }
      }
    })
    await Promise.all(records);
  }
}