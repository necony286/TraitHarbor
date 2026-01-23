import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { writeFile, unlink } from 'fs/promises';
import os from 'os';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { BrowserlessConnectError, getBrowser } from '../lib/pdf';

vi.mock('puppeteer-core', () => {
  const connect = vi.fn();
  const launch = vi.fn();
  return {
    default: { connect, launch },
    connect,
    launch
  };
});

const mockedPuppeteer = puppeteer as unknown as {
  connect: ReturnType<typeof vi.fn>;
  launch: ReturnType<typeof vi.fn>;
};

const createBrowser = () => ({
  close: vi.fn().mockResolvedValue(undefined),
  disconnect: vi.fn().mockResolvedValue(undefined)
});

const createTempExecutable = async () => {
  const tempPath = path.join(os.tmpdir(), `chrome-${Date.now()}-${Math.random()}`);
  await writeFile(tempPath, '');
  return tempPath;
};

describe('getBrowser', () => {
  const originalEnv = { ...process.env };
  let tempExecutablePath: string | null = null;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(async () => {
    if (tempExecutablePath) {
      await unlink(tempExecutablePath);
      tempExecutablePath = null;
    }
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it('connects to browserless when configured', async () => {
    process.env.BROWSERLESS_WS_ENDPOINT = 'ws://browserless.example.com/';
    const browser = createBrowser();
    mockedPuppeteer.connect.mockResolvedValue(browser);

    const handle = await getBrowser();

    expect(mockedPuppeteer.connect).toHaveBeenCalledWith({
      browserWSEndpoint: 'ws://browserless.example.com/'
    });
    expect(mockedPuppeteer.launch).not.toHaveBeenCalled();

    await handle.cleanup();
    expect(browser.disconnect).toHaveBeenCalledTimes(1);
  });

  it('falls back to a local browser when browserless is not configured', async () => {
    delete process.env.BROWSERLESS_WS_ENDPOINT;
    delete process.env.BROWSERLESS_TOKEN;
    process.env.REPORT_LOCAL_FALLBACK = '1';
    tempExecutablePath = await createTempExecutable();
    process.env.CHROME_EXECUTABLE_PATH = tempExecutablePath;
    const browser = createBrowser();
    mockedPuppeteer.launch.mockResolvedValue(browser);

    const handle = await getBrowser();

    expect(mockedPuppeteer.connect).not.toHaveBeenCalled();
    expect(mockedPuppeteer.launch).toHaveBeenCalledWith({
      executablePath: tempExecutablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true
    });

    await handle.cleanup();
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it('falls back to a local browser when browserless connection fails', async () => {
    process.env.BROWSERLESS_WS_ENDPOINT = 'ws://browserless.example.com/';
    process.env.REPORT_LOCAL_FALLBACK = '1';
    tempExecutablePath = await createTempExecutable();
    process.env.CHROME_EXECUTABLE_PATH = tempExecutablePath;
    mockedPuppeteer.connect.mockRejectedValue(new Error('connection failed'));
    const browser = createBrowser();
    mockedPuppeteer.launch.mockResolvedValue(browser);

    const handle = await getBrowser();

    expect(mockedPuppeteer.connect).toHaveBeenCalledWith({
      browserWSEndpoint: 'ws://browserless.example.com/'
    });
    expect(mockedPuppeteer.launch).toHaveBeenCalledTimes(1);

    await handle.cleanup();
    expect(browser.close).toHaveBeenCalledTimes(1);
  });

  it('throws when browserless connection fails without a fallback', async () => {
    process.env.BROWSERLESS_WS_ENDPOINT = 'ws://browserless.example.com/';
    mockedPuppeteer.connect.mockRejectedValue(new Error('connection failed'));

    await expect(getBrowser()).rejects.toBeInstanceOf(BrowserlessConnectError);
    expect(mockedPuppeteer.launch).not.toHaveBeenCalled();
  });
});
