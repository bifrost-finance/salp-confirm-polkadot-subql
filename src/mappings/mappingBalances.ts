import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { TransferBatch } from "../types";
import { Bytes } from "@polkadot/types";
import { SignedBlock, Balance } from "@polkadot/types/interfaces";

const MultiSignedAccount = [
  { address: "126TwBzBM4jUEK2gTphmW4oLoBWWnYvPp8hygmduTr4uds57", para_id: 2050 },
  { address: "16D2eVuK5SWfwvtFD3gVdBC2nc2BafK31BY6PrbZHBAGew7L", para_id: 2070 },
  { address: "1egYCubF1U5CGWiXjQnsXduiJYP49KTs8eX1jn1JrTqCYyQ", para_id: 2090 },
  { address: "16kZJGPJ37uYxjs7adswyEHbPYeHS9jQHSaSUJhkfvWPcoeF" }
]
const BatchCallId = "26,0"; // 0x1a00
const BatchAllCallId = "26,2"; // 0x1a02
const BalancesTransferCallId = "0x0500";
const SystemRemarkCallId = "0,1";
const SystemRemarkWithEventCallId = "0x0009";

export async function handleBalancesTransfer(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();

  const { event: { data: [from, to, balance] } } = event;
  const account = MultiSignedAccount.find(vendor => vendor.address === to.toString());
  const tx = event.extrinsic.extrinsic.method;
  if (tx !== undefined && tx.callIndex.toString() === BatchAllCallId && account !== undefined) {
    const record = new TransferBatch(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.block_hash = event.block.hash ? event.block.hash.toString() : null;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic ? event.extrinsic.idx : null;
    record.extrinsic_hash = event.extrinsic ? event.extrinsic.extrinsic.hash.toString() : null;
    record.block_timestamp = event.block.timestamp;
    record.from = from.toString();
    record.to = to.toString();
    record.balance = (balance as Balance).toBigInt();

    const args = JSON.parse(JSON.stringify(tx.args));
    args[0].forEach((value, index) => {
      if (index == 1 && value.callIndex.toString() === SystemRemarkWithEventCallId) {
        record.para_id = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
      }
      if (index == 2 && value.callIndex.toString() === SystemRemarkWithEventCallId) {
        record.referrer = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
      }
    })
    await record.save();
  }
}

function hex_to_ascii(str1) {
  var hex = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}