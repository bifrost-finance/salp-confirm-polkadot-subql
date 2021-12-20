import { SubstrateEvent } from "@subql/types";
import { SignedBlock, Balance } from "@polkadot/types/interfaces";
import { Compact } from '@polkadot/types';
import type { ParaId } from '@polkadot/types/interfaces/parachains';
import { Contributed, AllRefunded } from "../types/models";

export async function handleContributed(event: SubstrateEvent): Promise<void> {
  const { event: { data: [account_id_origin, para_id_origin, balance_origin] } } = event;
  const balance = (balance_origin as Compact<Balance>).toBigInt();
  const account_id = account_id_origin.toString();
  const para_id = (para_id_origin as ParaId).toNumber();
  const blockNumber = event.block.block.header.number.toNumber();
  const entity = new Contributed(blockNumber.toString() + '-' + event.idx.toString());
  entity.blockHeight = blockNumber;
  entity.eventId = event.idx;
  entity.extrinsicId = event.extrinsic.idx;
  entity.block_timestamp = event.block.timestamp;
  entity.accountId = account_id;
  entity.paraId = para_id;
  entity.balanceOf = balance;
  await entity.save();
}

export async function handleAllRefunded(event: SubstrateEvent): Promise<void> {
  const { event: { data: [para_id_origin] } } = event;
  const para_id = (para_id_origin as ParaId).toNumber();
  const blockNumber = event.block.block.header.number.toNumber();
  const entity = new AllRefunded(blockNumber.toString() + '-' + event.idx.toString());
  entity.block_height = blockNumber;
  entity.event_id = event.idx;
  entity.extrinsic_id = event.extrinsic.idx;
  entity.block_timestamp = event.block.timestamp;
  entity.para_id = para_id;
  await entity.save();
}