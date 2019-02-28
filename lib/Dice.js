const d3 = require('d3');

export default class Dice {
  static onimported(StatKnife) {
    StatKnife.Dice = Dice;
  }
  constructor(seed) {
    this.x = seed;
    this.y = this.z = this.w = 0.0;
  }

  uint32() {
    // XorShift128
    const t = this.x^(this.x<<11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w ^= (this.w>>>19)^(t^(t>>>8));
    return this.w;
  }
  float64() {
    return this.uint32()/0x100000000 + 0.5;
  }

  normalDist(mu=0.0, sigma=1.0) {
    return d3.randomNormal.source(() => this.float64())(mu, sigma);
  }
  uniformDist(min=0.0, max=1.0) {
    return d3.randomUniform.source(() => this.float64())(min, max);
  }
}