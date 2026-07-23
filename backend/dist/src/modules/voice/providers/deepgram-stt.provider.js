"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DeepgramSttProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepgramSttProvider = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@deepgram/sdk");
let DeepgramSttProvider = DeepgramSttProvider_1 = class DeepgramSttProvider {
    logger = new common_1.Logger(DeepgramSttProvider_1.name);
    deepgramClient = null;
    partialCallback;
    finalCallback;
    errorCallback;
    async connect() {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            this.logger.error('DEEPGRAM_API_KEY is not defined in .env');
            throw new Error('DEEPGRAM_API_KEY is missing');
        }
        const deepgram = (0, sdk_1.createClient)(apiKey);
        this.deepgramClient = deepgram.listen.live({
            model: 'nova-2',
            language: 'en-US',
            smart_format: true,
            encoding: 'linear16',
            sample_rate: 16000,
            channels: 1,
            interim_results: true,
            endpointing: 300,
            utterance_end_ms: 1000,
        });
        return new Promise((resolve, reject) => {
            if (!this.deepgramClient)
                return reject(new Error('Deepgram client not created'));
            this.deepgramClient.on(sdk_1.LiveTranscriptionEvents.Open, () => {
                this.logger.log('Deepgram WebSocket connected');
                resolve();
            });
            this.deepgramClient.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
                const transcript = data.channel.alternatives[0].transcript;
                if (!transcript)
                    return;
                if (data.is_final) {
                    if (this.finalCallback)
                        this.finalCallback(transcript);
                }
                else {
                    if (this.partialCallback)
                        this.partialCallback(transcript);
                }
            });
            this.deepgramClient.on(sdk_1.LiveTranscriptionEvents.Error, (err) => {
                this.logger.error('Deepgram Error', err);
                if (this.errorCallback)
                    this.errorCallback(err);
            });
            this.deepgramClient.on(sdk_1.LiveTranscriptionEvents.Close, () => {
                this.logger.log('Deepgram WebSocket disconnected');
            });
        });
    }
    disconnect() {
        if (this.deepgramClient) {
            this.deepgramClient.requestClose();
            this.deepgramClient = null;
        }
    }
    sendAudio(chunk) {
        if (this.deepgramClient && this.deepgramClient.getReadyState() === 1) {
            this.deepgramClient.send(chunk);
        }
    }
    onPartialTranscript(callback) {
        this.partialCallback = callback;
    }
    onFinalTranscript(callback) {
        this.finalCallback = callback;
    }
    onError(callback) {
        this.errorCallback = callback;
    }
};
exports.DeepgramSttProvider = DeepgramSttProvider;
exports.DeepgramSttProvider = DeepgramSttProvider = DeepgramSttProvider_1 = __decorate([
    (0, common_1.Injectable)()
], DeepgramSttProvider);
//# sourceMappingURL=deepgram-stt.provider.js.map