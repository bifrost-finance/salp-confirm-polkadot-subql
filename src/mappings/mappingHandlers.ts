import { SubstrateBlock, SubstrateEvent } from "@subql/types";
import { DemocracyInfo, CouncilInfo } from '../types/models';

export async function democracy(block: SubstrateBlock): Promise<void> {
  const blockNumber = block.block.header.number.toNumber();
  const democracyEvents = block.events.filter(e => (e.event.section === 'democracy')) as SubstrateEvent[];
  for (let democracyEvent of democracyEvents) {
    const { event: { data, section, method } } = democracyEvent;
    const record = new DemocracyInfo(blockNumber.toString() + '-' + democracyEvent.idx.toString());
    record.event_id = democracyEvent.idx;
    record.extrinsic_id = democracyEvent.extrinsic ? democracyEvent.extrinsic.idx : null;
    record.block_height = blockNumber;
    record.block_timestamp = block.timestamp;
    record.method = method.toString();
    record.data = data.toString();
    await record.save();
  }
}

export async function council(block: SubstrateBlock): Promise<void> {
  const blockNumber = block.block.header.number.toNumber();
  const councilEvents = block.events.filter(e => (e.event.section === 'council')) as SubstrateEvent[];
  for (let councilEvent of councilEvents) {
    const { event: { data, section, method } } = councilEvent;
    const record = new CouncilInfo(blockNumber.toString() + '-' + councilEvent.idx.toString());
    record.event_id = councilEvent.idx;
    record.extrinsic_id = councilEvent.extrinsic ? councilEvent.extrinsic.idx : null;
    record.block_height = blockNumber;
    record.block_timestamp = block.timestamp;
    record.method = method.toString();
    record.data = data.toString();
    await record.save();
  }
}