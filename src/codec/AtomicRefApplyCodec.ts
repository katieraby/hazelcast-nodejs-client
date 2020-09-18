/*
 * Copyright (c) 2008-2020, Hazelcast, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable max-len */
import {BitsUtil} from '../util/BitsUtil';
import {FixSizedTypesCodec} from './builtin/FixSizedTypesCodec';
import {ClientMessage, Frame, PARTITION_ID_OFFSET} from '../protocol/ClientMessage';
import {RaftGroupId} from '../proxy/cpsubsystem/RaftGroupId';
import {RaftGroupIdCodec} from './custom/RaftGroupIdCodec';
import {StringCodec} from './builtin/StringCodec';
import {Data} from '../serialization/Data';
import {DataCodec} from './builtin/DataCodec';
import {CodecUtil} from './builtin/CodecUtil';

// hex: 0x0A0100
const REQUEST_MESSAGE_TYPE = 655616;
// hex: 0x0A0101
// RESPONSE_MESSAGE_TYPE = 655617

const REQUEST_RETURN_VALUE_TYPE_OFFSET = PARTITION_ID_OFFSET + BitsUtil.INT_SIZE_IN_BYTES;
const REQUEST_ALTER_OFFSET = REQUEST_RETURN_VALUE_TYPE_OFFSET + BitsUtil.INT_SIZE_IN_BYTES;
const REQUEST_INITIAL_FRAME_SIZE = REQUEST_ALTER_OFFSET + BitsUtil.BOOLEAN_SIZE_IN_BYTES;

/** @internal */
export class AtomicRefApplyCodec {
    static encodeRequest(groupId: RaftGroupId, name: string, _function: Data, returnValueType: number, alter: boolean): ClientMessage {
        const clientMessage = ClientMessage.createForEncode();
        clientMessage.setRetryable(false);

        const initialFrame = Frame.createInitialFrame(REQUEST_INITIAL_FRAME_SIZE);
        FixSizedTypesCodec.encodeInt(initialFrame.content, REQUEST_RETURN_VALUE_TYPE_OFFSET, returnValueType);
        FixSizedTypesCodec.encodeBoolean(initialFrame.content, REQUEST_ALTER_OFFSET, alter);
        clientMessage.addFrame(initialFrame);
        clientMessage.setMessageType(REQUEST_MESSAGE_TYPE);
        clientMessage.setPartitionId(-1);

        RaftGroupIdCodec.encode(clientMessage, groupId);
        StringCodec.encode(clientMessage, name);
        DataCodec.encode(clientMessage, _function);
        return clientMessage;
    }

    static decodeResponse(clientMessage: ClientMessage): Data {
        // empty initial frame
        clientMessage.nextFrame();

        return CodecUtil.decodeNullable(clientMessage, DataCodec.decode);
    }
}
