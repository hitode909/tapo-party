const tapo = require("tp-link-tapo-connect");

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const randomColor = () => {
  const ff00 = () => (Math.random() >= 0.5 ? "FF" : "00");
  const c = `#${ff00()}${ff00()}${ff00()}`;
  if (c === "#000000" || c === "#FFFFFF") {
    return randomColor();
  } else {
    return c;
  }
};

const run = async () => {
  const cloudToken = await tapo.cloudLogin(
    process.env.TAPO_USERNAME,
    process.env.TAPO_PASSWORD
  );

  const devices = await tapo.listDevicesByType(cloudToken, "SMART.TAPOBULB");
  const targetDeviceNames = [...process.argv].splice(2);
  const lamps =
    targetDeviceNames.length > 0
      ? devices.filter((d) => targetDeviceNames.includes(d.alias))
      : devices;
  const deviceTokens = [];
  for (const lamp of lamps) {
    deviceTokens.push(
      await tapo.loginDevice(
        process.env.TAPO_USERNAME,
        process.env.TAPO_PASSWORD,
        lamp
      )
    );
  }

  for (const token of deviceTokens) {
    const changed = tapo.setBrightness(token, 100);
  }

  while (true) {
    for (const token of deviceTokens) {
      const changed = tapo.setColour(token, randomColor());
      changed.catch((e) => console.warn(e));
    }
    await wait(500);
  }
};

run();
