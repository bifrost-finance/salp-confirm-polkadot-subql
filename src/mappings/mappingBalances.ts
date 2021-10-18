import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { BalancesTransfer } from "../types";
import { Balance } from "@polkadot/types/interfaces";

const MultiSignedAccount = ["1UbTddpy3RggGy3nk1vAc3msmSBasbhiYRQZnAdvNdUSXJn"]

export async function handleBalancesTransfer(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();

  const { event: { data: [from, to, balance] } } = event;
  if (MultiSignedAccount.includes(to.toString())) {
    const record = new BalancesTransfer(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic ? event.extrinsic.idx : null;
    record.block_timestamp = event.block.timestamp;
    record.from = from.toString();
    record.to = to.toString();
    record.balance = (balance as Balance).toBigInt();
    await record.save();
  }
}

