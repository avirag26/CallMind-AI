"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserTransportAdapter = void 0;
class BrowserTransportAdapter {
    client;
    audioReceiveCallback;
    endSessionCallback;
    constructor(client) {
        this.client = client;
    }
    pushAudio(chunk) {
        if (this.audioReceiveCallback) {
            this.audioReceiveCallback(chunk);
        }
    }
    pushEndSession() {
        if (this.endSessionCallback) {
            this.endSessionCallback();
        }
    }
    onAudioReceive(callback) {
        this.audioReceiveCallback = callback;
    }
    onEndSession(callback) {
        this.endSessionCallback = callback;
    }
    playAudio(audio) {
        this.client.emit('audio-chunk', audio);
    }
    interrupt(partialText) {
        this.client.emit('voice-state', { status: 'Interrupted', partial: partialText });
    }
    sendState(state) {
        this.client.emit('voice-state', state);
    }
}
exports.BrowserTransportAdapter = BrowserTransportAdapter;
//# sourceMappingURL=browser-transport.adapter.js.map