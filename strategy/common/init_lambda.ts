async function initLambda() {
  while (true) {
    await nextFrame();
  }
}

async function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 1);
  });
}

initLambda();

export default {};
