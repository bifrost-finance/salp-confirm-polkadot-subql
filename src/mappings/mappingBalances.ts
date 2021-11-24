import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { TransferBatch, Contributed, ContributedBatch } from "../types";
import { Bytes, Compact } from "@polkadot/types";
import { SignedBlock, Balance } from "@polkadot/types/interfaces";
import type { ParaId } from '@polkadot/types/interfaces/parachains';

const MultiSignedAccount = [
  { address: "14AMZ3gw4tRsrdp78i4MmHZ8EFbXTMfuXGQMEC3t1GoqLboH" }
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
        const para_id_str = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
        if (typeof para_id_str === 'number' || Number(para_id_str) !== 0) {
          record.para_id = Number(para_id_str);
        }
      }
      if (index == 2 && value.callIndex.toString() === SystemRemarkWithEventCallId) {
        record.referrer = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
      }
      if (index == 3 && value.callIndex.toString() === SystemRemarkWithEventCallId) {
        record.eth_address = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
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

export async function handleContributed2(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();

  const { event: { data: [account_id_origin, para_id_origin, balance_origin] } } = event;
  const balance = (balance_origin as Compact<Balance>).toBigInt();
  const account_id = account_id_origin.toString();
  const para_id = (para_id_origin as ParaId).toNumber();
  const account = MultiSignedAccount.find(vendor => vendor.address === account_id);
  const tx = event.extrinsic.extrinsic.method;
  if (tx !== undefined && tx.callIndex.toString() === BatchAllCallId && account !== undefined) {
    const record = new ContributedBatch(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.block_hash = event.block.hash ? event.block.hash.toString() : null;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic ? event.extrinsic.idx : null;
    record.extrinsic_hash = event.extrinsic ? event.extrinsic.extrinsic.hash.toString() : null;
    record.block_timestamp = event.block.timestamp;
    record.accountId = account_id;
    record.paraId = para_id;
    record.balanceOf = balance;

    const args = JSON.parse(JSON.stringify(tx.args));
    logger.info(JSON.stringify(tx.args))
    args[0].forEach((value, index) => {
      if (index == 2 && value.callIndex.toString() === SystemRemarkWithEventCallId) {
        record.account = hex_to_ascii((value.args.remark as Bytes).toString().slice(2));
      }
    })
    await record.save();
  }
}