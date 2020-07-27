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
import {BitsUtil} from '../BitsUtil';
import {FixSizedTypesCodec} from './builtin/FixSizedTypesCodec';
import {ClientMessage, Frame, PARTITION_ID_OFFSET} from '../ClientMessage';
import * as Long from 'long';
import {StringCodec} from './builtin/StringCodec';
import {ByteArrayCodec} from './builtin/ByteArrayCodec';

// hex: 0x000C00
const REQUEST_MESSAGE_TYPE = 3072;
// hex: 0x000C01
// RESPONSE_MESSAGE_TYPE = 3073

const REQUEST_TIMESTAMP_OFFSET = PARTITION_ID_OFFSET + BitsUtil.INT_SIZE_IN_BYTES;
const REQUEST_INITIAL_FRAME_SIZE = REQUEST_TIMESTAMP_OFFSET + BitsUtil.LONG_SIZE_IN_BYTES;

export class ClientStatisticsCodec {
    static encodeRequest(timestamp: Long, clientAttributes: string, metricsBlob: Buffer): ClientMessage {
        const clientMessage = ClientMessage.createForEncode();
        clientMessage.setRetryable(false);

        const initialFrame = Frame.createInitialFrame(REQUEST_INITIAL_FRAME_SIZE);
        FixSizedTypesCodec.encodeLong(initialFrame.content, REQUEST_TIMESTAMP_OFFSET, timestamp);
        clientMessage.addFrame(initialFrame);
        clientMessage.setMessageType(REQUEST_MESSAGE_TYPE);
        clientMessage.setPartitionId(-1);

        StringCodec.encode(clientMessage, clientAttributes);
        ByteArrayCodec.encode(clientMessage, metricsBlob);
        return clientMessage;
    }
}