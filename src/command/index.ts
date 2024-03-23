#!/usr/bin/env node

import os from 'os';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { unstable_dev } from 'wrangler';
import minimist from 'minimist';
import '@colors/colors';

const readPackage = () => {
  try {
    return require(path.resolve(__dirname, '../../package.json'));
  } catch (e) {}
  return require(path.resolve(__dirname, '../package.json'));
};

const main = async () => {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      r: 'remote',
      c: 'config',
      e: 'env',
      l: 'log',
    },
    boolean: ['remote'],
  });

  const scriptPath = argv._[0];

  if (!scriptPath) {
    const pkg = readPackage();
    console.log(`${pkg.name} ${pkg.version}\n`.blue);
    console.log('USAGE'.bold);
    console.log('\tcommand [options] <path>');
    console.log('ARGUMENTS'.bold);
    console.log(`\t<path> Path to the script file`);
    console.log('OPTIONS'.bold);
    console.log(`\t-r, --remote Run remotely(Default is local)`);
    console.log(`\t-c, --config <path> Path to the wrangler config file(Default is wrangler.toml)`);
    console.log(`\t-e, --env <environment> Environment`);
    console.log(`\t-l, --log <logLevel> "log" | "none" | "info" | "error" | "warn" | "debug"`);
  } else {
    const config = argv.config ?? 'wrangler.toml';
    const templateSrc = fs.readFileSync(
      path.join(__dirname, '../template', 'script.template'),
      'utf8'
    );
    const script = templateSrc.replace(
      '{{SCRIPT_PATH}}',
      path.resolve(process.cwd(), scriptPath).replaceAll('\\', '/')
    );
    const tmpPath = fs.mkdtempSync(path.join(os.tmpdir(), 'cloudflare-exec'));
    const executeFilePath = path.join(
      tmpPath,
      `execute-${createHash('sha1')
        .update(new Date().getTime() + script)
        .digest('hex')}.ts`
    );
    fs.writeFileSync(executeFilePath, script);

    const local = !argv.remote;
    const env = argv.env;
    const logLevel = argv.log;
    const worker = await unstable_dev(executeFilePath, {
      experimental: { disableExperimentalWarning: true, testMode: true },
      local,
      config,
      env,
      logLevel,
    });
    await worker.fetch('http://localhost/', { method: 'POST' });
    await worker.waitUntilExit();
    await worker.stop();
    fs.rmSync(executeFilePath);
    process.exit(0);
  }
};

main();
