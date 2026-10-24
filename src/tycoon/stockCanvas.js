/**
 * High-Precision HTML5 Canvas Candlestick & Volume Chart Engine
 * Renders Japanese candlesticks, 7-period SMA trendline, volume histogram,
 * and mouse-hover crosshair tooltips with HiDPI support.
 */

export class StockCanvasChart {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Object} options
   */
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.history = [];
    this.ticker = '';
    this.hoverIndex = -1;
    this.mousePos = { x: -1, y: -1 };
    this.dpr = window.devicePixelRatio || 1;

    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;
    this.render();
  }

  handleMouseLeave() {
    this.mousePos.x = -1;
    this.mousePos.y = -1;
    this.hoverIndex = -1;
    this.render();
  }

  setData(ticker, history) {
    this.ticker = ticker;
    this.history = history || [];
    this.render();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (width === 0 || height === 0) return;

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * this.dpr;
    this.canvas.height = height * this.dpr;
    this.render();
  }

  render() {
    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;
    const ctx = this.ctx;

    if (!ctx || width <= 0 || height <= 0) return;

    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    // Dark sleek terminal background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    if (!this.history || this.history.length === 0) {
      ctx.fillStyle = '#64748B';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Menunggu data feed bursa saham...', width / 2, height / 2);
      ctx.restore();
      return;
    }

    const padding = { top: 20, right: 65, bottom: 45, left: 16 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = (height - padding.top - padding.bottom) * 0.72;
    const volumeHeight = (height - padding.top - padding.bottom) * 0.24;
    const volumeTop = padding.top + chartHeight + 10;

    // Calculate price domain
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (const c of this.history) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    }

    const priceBuffer = Math.max(0.5, (maxPrice - minPrice) * 0.1);
    minPrice = Math.max(0.01, minPrice - priceBuffer);
    maxPrice = maxPrice + priceBuffer;
    const priceRange = maxPrice - minPrice;

    // Helper: Map price to Y
    const priceToY = (p) => padding.top + chartHeight - ((p - minPrice) / priceRange) * chartHeight;
    // Helper: Map volume to Y
    const volToH = (v) => (v / (maxVolume || 1)) * volumeHeight;

    // Draw horizontal grid lines & price markers
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.fillStyle = '#64748B';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const priceVal = minPrice + (priceRange / gridSteps) * i;
      const y = priceToY(priceVal);

      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillText(`$${priceVal.toFixed(2)}`, width - padding.right + 8, y + 3);
    }

    // Volume baseline
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.moveTo(padding.left, volumeTop + volumeHeight);
    ctx.lineTo(width - padding.right, volumeTop + volumeHeight);
    ctx.stroke();

    const candleCount = this.history.length;
    const stepX = chartWidth / candleCount;
    const candleWidth = Math.max(3, Math.min(18, stepX * 0.68));

    // Calculate 7-period Simple Moving Average
    const sma7 = [];
    for (let i = 0; i < candleCount; i++) {
      if (i < 6) {
        sma7.push(null);
      } else {
        let sum = 0;
        for (let j = i - 6; j <= i; j++) sum += this.history[j].close;
        sma7.push(sum / 7);
      }
    }

    // Determine hover index
    let hoveredCandle = null;
    let hoveredX = -1;
    let hoveredY = -1;
    if (this.mousePos.x >= padding.left && this.mousePos.x <= width - padding.right) {
      const relX = this.mousePos.x - padding.left;
      const idx = Math.min(candleCount - 1, Math.max(0, Math.floor(relX / stepX)));
      hoveredCandle = this.history[idx];
      hoveredX = padding.left + idx * stepX + stepX / 2;
      hoveredY = priceToY(hoveredCandle.close);
    }

    // Render Candles and Volume Bars
    for (let i = 0; i < candleCount; i++) {
      const c = this.history[i];
      const cx = padding.left + i * stepX + stepX / 2;
      const isBull = c.close >= c.open;
      const color = isBull ? '#10B981' : '#F43F5E';
      const wickColor = isBull ? 'rgba(16, 185, 129, 0.85)' : 'rgba(244, 63, 94, 0.85)';

      // 1. Draw Volume bar
      const vHeight = volToH(c.volume);
      ctx.fillStyle = isBull ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)';
      ctx.fillRect(cx - candleWidth / 2, volumeTop + volumeHeight - vHeight, candleWidth, vHeight);

      // 2. Draw Wick
      const yHigh = priceToY(c.high);
      const yLow = priceToY(c.low);
      ctx.beginPath();
      ctx.strokeStyle = wickColor;
      ctx.lineWidth = 1.2;
      ctx.moveTo(cx, yHigh);
      ctx.lineTo(cx, yLow);
      ctx.stroke();

      // 3. Draw Body
      const yOpen = priceToY(c.open);
      const yClose = priceToY(c.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

      ctx.fillStyle = color;
      ctx.fillRect(cx - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    }

    // Render SMA 7 Trendline
    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    let started = false;
    for (let i = 0; i < candleCount; i++) {
      if (sma7[i] !== null) {
        const cx = padding.left + i * stepX + stepX / 2;
        const cy = priceToY(sma7[i]);
        if (!started) {
          ctx.moveTo(cx, cy);
          started = true;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
    }
    ctx.stroke();

    // Crosshair & Tooltip on Hover
    if (hoveredCandle) {
      ctx.save();
      // Dotted crosshair
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(248, 250, 252, 0.4)';
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoveredX, padding.top);
      ctx.lineTo(hoveredX, volumeTop + volumeHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padding.left, hoveredY);
      ctx.lineTo(width - padding.right, hoveredY);
      ctx.stroke();

      // Price Tag on Right Axis
      ctx.setLineDash([]);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(width - padding.right, hoveredY - 10, padding.right - 4, 20);
      ctx.strokeStyle = '#38BDF8';
      ctx.strokeRect(width - padding.right, hoveredY - 10, padding.right - 4, 20);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${hoveredCandle.close.toFixed(2)}`, width - padding.right + 4, hoveredY + 3.5);

      // Tooltip Card in top-left corner
      const changePct = ((hoveredCandle.close - hoveredCandle.open) / hoveredCandle.open) * 100;
      const isUp = changePct >= 0;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
      ctx.lineWidth = 1;
      ctx.fillRect(padding.left + 8, padding.top + 6, 230, 24);
      ctx.strokeRect(padding.left + 8, padding.top + 6, 230, 24);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`O:`, padding.left + 14, padding.top + 21);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(`${hoveredCandle.open.toFixed(2)}`, padding.left + 26, padding.top + 21);

      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`H:`, padding.left + 64, padding.top + 21);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(`${hoveredCandle.high.toFixed(2)}`, padding.left + 76, padding.top + 21);

      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`L:`, padding.left + 114, padding.top + 21);
      ctx.fillStyle = '#F8FAFC';
      ctx.fillText(`${hoveredCandle.low.toFixed(2)}`, padding.left + 125, padding.top + 21);

      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`C:`, padding.left + 162, padding.top + 21);
      ctx.fillStyle = isUp ? '#10B981' : '#F43F5E';
      ctx.fillText(`${hoveredCandle.close.toFixed(2)} (${isUp ? '+' : ''}${changePct.toFixed(1)}%)`, padding.left + 174, padding.top + 21);

      ctx.restore();
    }

    ctx.restore();
  }
}
