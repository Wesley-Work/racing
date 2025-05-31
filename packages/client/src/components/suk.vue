<template>
  <div ref="pixiContainer" class="pixi-container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Application, Graphics } from 'pixi.js';

const pixiContainer = ref(null);
let app;

async function initPixiAndDrawSuzukaCircuit() {
  // 创建应用实例
  app = new Application();

  // 初始化应用配置（v8 推荐方式）
  await app.init({
    width: 800,
    height: 600,
    background: '#1099bb',
    resizeTo: window,
  });

  // 将 canvas 添加到 DOM 容器中
  if (pixiContainer.value) {
    console.log(app);
    pixiContainer.value.appendChild(app.canvas); // 注意：这里使用 .canvas 替代 .view
  }

  // 绘制赛道图形
  const graphics = new Graphics();
  graphics.beginPath();
  graphics.setStrokeStyle({ width: 4, color: '#fa5151' });

  // 简化版铃鹿赛道路径（你可以根据真实布局调整坐标）

  graphics.moveTo(50, 300);
  //   graphics.lineTo(150, 300);
  graphics.arc(150, 200, 100, Math.PI, 0, true); // 左弯
  graphics.lineTo(250, 200);
  graphics.arc(350, 200, 100, Math.PI, 0, false); // 右弯
  graphics.lineTo(450, 300);
  graphics.lineTo(450, 400);
  graphics.arc(350, 400, 100, 0, Math.PI, true); // 下方左弯
  graphics.lineTo(250, 500);
  graphics.arc(150, 500, 100, 0, Math.PI, false); // 返回起点方向
  graphics.lineTo(50, 300);
  graphics.stroke();

  // 将图形添加到舞台
  app.stage.addChild(graphics);

  const testCircle = new Graphics();
  testCircle.setStrokeStyle(4, 0x00ff00);
  testCircle.circle(100, 100, 8);
  testCircle.fill();
  app.stage.addChild(testCircle);
}

onMounted(() => {
  initPixiAndDrawSuzukaCircuit();
});
</script>

<style scoped>
.pixi-container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
