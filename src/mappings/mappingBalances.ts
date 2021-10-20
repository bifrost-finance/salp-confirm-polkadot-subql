import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from "@subql/types";
import { BalancesTransfer } from "../types";
import { Balance } from "@polkadot/types/interfaces";

const MultiSignedAccount = [
  { address: "1UbTddpy3RggGy3nk1vAc3msmSBasbhiYRQZnAdvNdUSXJn", para_id: 2000 },
  { address: "148fP7zCq1JErXCy92PkNam4KZNcroG9zbbiPwMB1qehgeT4", para_id: 2001 }
]

export async function handleBalancesTransfer(event: SubstrateEvent): Promise<void> {
  const blockNumber = event.block.block.header.number.toNumber();

  const { event: { data: [from, to, balance] } } = event;
  const account = MultiSignedAccount.find(vendor => vendor.address === to.toString());
  if (account !== undefined) {
    const record = new BalancesTransfer(blockNumber.toString() + '-' + event.idx.toString());
    record.block_height = blockNumber;
    record.event_id = event.idx;
    record.extrinsic_id = event.extrinsic ? event.extrinsic.idx : null;
    record.block_timestamp = event.block.timestamp;
    record.from = from.toString();
    record.to = to.toString();
    record.balance = (balance as Balance).toBigInt();
    record.para_id = account.para_id;
    await record.save();
  }
}

