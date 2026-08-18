#!/usr/bin/env node
import { program } from "commander";
import {
  registerPipelineCommand,
  registerExtractCommand,
  registerAnalyzeCommand,
  registerSpecCommand,
  registerGenerateCommand,
  registerLearnCommand,
  registerReferencesCommand,
  registerGenerateRefCommand,
  registerScreenshotCommand,
  registerCompareCommand,
} from "./commands/index.js";

// Register all commands
registerPipelineCommand();
registerExtractCommand();
registerAnalyzeCommand();
registerSpecCommand();
registerGenerateCommand();
registerLearnCommand();
registerReferencesCommand();
registerGenerateRefCommand();
registerScreenshotCommand();
registerCompareCommand();

program.parse();
