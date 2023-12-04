// todo: better raw functionality

const message = {
  log: (str: string, color: string) =>
    console.log(`\x1B[${color}m${str}\x1B[0m`),
  success: (str: string) => message.log(`${str} ✓`, "32"),
  info: (str: string) => message.log(`⚠ ${str}`, "33"),
  error: (str: string) => message.log(`${str} 𐄂`, "31"),
};

try {
  interface File {
    year: string;
    name: string;
  }

  let raw = false,
    args = [];
  if (Deno.args[0] in ["-d", "--data", "--as-data", "-r", "--raw"]) {
    raw = true;
    args = Deno.args.slice(1);
  } else {
    args = Deno.args;
  }
  const files: File[] = [];
  for (const [year, file] of args.map(e => e.split("/"))) {
    if (file === "XX") {
      for await (const script of Deno.readDir(`./${year}`)) {
        if (script.name === "README.md" || script.name === "data") {
          message.info(`Ignoring ${year}'s ${script.name} file`);
          continue;
        }

        files.push({
          year,
          name: script.name.split(".")[0],
        });
        message.success(`Queueing ${year}'s ${script.name} file`);
      }
    } else {
      try {
        await Deno.stat(`./${year}/${file}.ts`);
      } catch {
        message.info(`./${year}/${file}.ts does not exist`);
      }

      files.push({
        year,
        name: file,
      });
      message.success(`Queueing ${year}'s ${file} file`);
    }
  }

  files.forEach(async file => {
    const solution = JSON.parse(
      new TextDecoder().decode(
        await Deno.readFile(`${file.year}/data/answers.json`)
      )
    )[file.name];
    const input = await Deno.readFile(`${file.year}/data/${file.name}.txt`);

    message.success(`Executing ${file.year}'s ${file.name} file`);
    const script = new Deno.Command(Deno.execPath(), {
      args: ["run", `./${file.year}/${file.name}.ts`],
      stdin: "piped",
      stdout: "piped",
    }).spawn();

    const writer = script.stdin.getWriter();
    writer.write(input);
    await writer.ready;
    writer.close();

    const { code, stdout: out } = await script.output();
    if (code !== 0)
      throw new EvalError(`${file.year}'s ${file} file failed to execute`);

    const result = new TextDecoder()
      .decode(out)
      .trim()
      .split("\n")
      .map(e => e.split(":")[1].trim());

    if (!raw) {
      if (result.every((e, i) => e === solution[i])) {
        message.success(
          `${file.year}'s ${file.name} file passed with answers ${result.join(
            ", "
          )}`
        );
      } else {
        message.error(
          `${file.year}'s ${file.name} file was unsuccessful with ${result.join(
            ", "
          )}`
        );
      }
    } else {
      message.success(`${file.year}/${file.name}: ${result.join(", ")}`);
    }
    script.unref();
  });
} catch (error) {
  message.error(`${error.name}: ${error.message}`);
}
