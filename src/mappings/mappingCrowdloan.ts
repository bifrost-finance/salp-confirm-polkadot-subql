import { SubstrateEvent } from "@subql/types";
import { Contributed } from "../types/models";

export async function handleContributed(event: SubstrateEvent): Promise<void> {
  const { event: { data: [account_id_origin, para_id_origin, balance_origin] } } = event;
  const balance = balance_origin.toString();
  const account_id = account_id_origin.toString();
  const para_id = para_id_origin.toString();
  const blockNumber = event.extrinsic.block.block.header.number.toNumber();
  const entity = new Contributed(blockNumber.toString() + '-' + event.idx.toString());
  entity.blockHeight = blockNumber;
  entity.eventId = event.idx;
  entity.extrinsicId = event.extrinsic.idx;
  entity.time = event.block.timestamp;
  entity.accountId = account_id;
  entity.paraId = para_id;
  entity.balanceOf = balance;
  await entity.save();
}