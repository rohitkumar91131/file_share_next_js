export class WebRTCManager {
    constructor(config) {
        this.config = config || { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
        this.pc = null;
        this.dataChannel = null;
        this.callbacks = {
            onIceCandidate: null,
            onDataChannel: null,
            onConnectionStateChange: null,
        };
    }

    initialize() {
        if (this.pc) this.close();

        this.pc = new RTCPeerConnection(this.config);

        this.pc.onicecandidate = (event) => {
            if (this.callbacks.onIceCandidate) {
                this.callbacks.onIceCandidate(event.candidate);
            }
        };

        this.pc.onconnectionstatechange = () => {
            if (this.callbacks.onConnectionStateChange) {
                this.callbacks.onConnectionStateChange(this.pc.connectionState);
            }
        };

        this.pc.ondatachannel = (event) => {
            console.log("Received DataChannel:", event.channel.label);
            this.setupDataChannel(event.channel);
            if (this.callbacks.onDataChannel) {
                this.callbacks.onDataChannel(event.channel);
            }
        };

        return this.pc;
    }

    createDataChannel(label) {
        if (!this.pc) throw new Error("PeerConnection not initialized");
        const dc = this.pc.createDataChannel(label);
        this.setupDataChannel(dc);
        return dc;
    }

    setupDataChannel(dc) {
        this.dataChannel = dc;
        dc.onopen = () => console.log("DataChannel Open");
        dc.onclose = () => console.log("DataChannel Closed");
        dc.onerror = (error) => {
            console.error("DataChannel Error:", error);
            if (error.error) {
                console.error("Detailed Error:", error.error.message || error.error);
            }
        };
    }

    async createOffer() {
        if (!this.pc) throw new Error("PeerConnection not initialized");
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        return offer;
    }

    async createAnswer() {
        if (!this.pc) throw new Error("PeerConnection not initialized");
        if (this.pc.signalingState === 'stable') {
            console.warn("⚠️ [WebRTC] Skipping createAnswer - already stable (likely race condition handled).");
            return null; // Or return existing localDescription
        }
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        return answer;
    }

    async setRemoteDescription(desc) {
        if (!this.pc) throw new Error("PeerConnection not initialized");
        await this.pc.setRemoteDescription(desc);
    }

    async addIceCandidate(candidate) {
        if (!this.pc) return;
        try {
            await this.pc.addIceCandidate(candidate);
        } catch (e) {
            console.error("Error adding ICE candidate", e);
        }
    }

    close() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
    }

    on(event, callback) {
        this.callbacks[event] = callback;
    }
}
