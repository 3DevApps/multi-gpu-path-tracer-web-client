type OnFrameCallback = (frame: VideoFrame) => void;

export default class H264Decoder {
  codecString: string;
  optimizeForLatency: boolean;
  width: number;
  height: number;
  decoder: VideoDecoder | null;
  firstFrame: boolean;
  onFrame: OnFrameCallback;

  constructor(width: number, height: number, onFrame: OnFrameCallback) {
    this.codecString = "avc1.42001E"; // Baseline profile
    this.optimizeForLatency = true;
    this.width = width;
    this.height = height;
    this.decoder = null;
    this.firstFrame = true;
    this.onFrame = onFrame;

    this.initDecoder();
  }

  async initDecoder() {
    const config = {
      codec: this.codecString,
      codedWidth: this.width,
      codedHeight: this.height,
      optimizeForLatency: this.optimizeForLatency,
    };

    if (!VideoDecoder.isConfigSupported(config)) {
      // TODO: inform user to change browser
      throw new Error("Unsupported codec configuration");
    }

    this.decoder = new VideoDecoder({
      output: (frame) => this.handleFrame(frame),
      error: (e) => console.error("Decoder error:", e),
    });
    this.decoder.configure(config);
  }

  parseNALUnits(data: Uint8Array): Uint8Array[] {
    const units: Uint8Array[] = [];
    let startIndex = 0;

    for (let i = 0; i < data.length - 3; i++) {
      const isStartCode =
        (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 1) ||
        (data[i] === 0 &&
          data[i + 1] === 0 &&
          data[i + 2] === 0 &&
          data[i + 3] === 1);

      if (isStartCode) {
        if (startIndex < i) {
          units.push(data.slice(startIndex, i));
        }

        const startCodeLength = data[i + 2] === 1 ? 3 : 4;
        startIndex = i;
        i += startCodeLength - 1;
      }
    }

    if (startIndex < data.length) {
      units.push(data.slice(startIndex));
    }

    return units;
  }

  isKeyFrame(nalUnit: Uint8Array): boolean {
    const nalType = nalUnit[0] & 0x1f;
    return nalType === 5;
  }

  async decode(encodedData: Uint8Array) {
    const nalUnits = this.parseNALUnits(encodedData);
    for (const nalUnit of nalUnits) {
      const chunk = new EncodedVideoChunk({
        type: this.isKeyFrame(nalUnit) ? "key" : "delta",
        timestamp: 0,
        data: nalUnit,
      });

      try {
        this.decoder!.decode(chunk);
      } catch (e) {
        !this.firstFrame && console.error("Error decoding chunk:", e);
      }
    }
    this.firstFrame = false;
  }

  handleFrame(frame: VideoFrame) {
    try {
      this.onFrame(frame);
    } finally {
      frame.close();
    }
  }

  destroy() {
    if (this.decoder) {
      this.decoder.close();
    }
  }
}
