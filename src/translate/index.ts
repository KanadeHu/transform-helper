/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import md5 from "md5";
import * as vscode from "vscode";
import { debounce } from 'lodash';


type TranstionItem = {
  src: string,
  dst: string
};

type TranstionResult = {
  from: string
  to: string
  trans_result: Array<TranstionItem>,
  error_code?: number
};

/**
 * @description check selection text is comment
 * @param text string
 */
const isCheckComment = (text: string) => {
  const reg = /(\/\/|\*)\s*(const|var|let)\s+[\u4e00-\u9fa5]+\s*/;

  const result = reg.exec(text);

  return !!result;
};

/**
 * @description replace lines
 */
const replaceLines = async (oldStr: string, translateText: string, uri: vscode.Uri, lineNum: number) => {
  const edit = new vscode.WorkspaceEdit();

  const newStr = oldStr.replace(/[\u4e00-\u9fa5]+/, translateText);
  const startPosition = new vscode.Position(lineNum, 0);
  const endPosition = new vscode.Position(lineNum, oldStr.length);

  edit.replace(uri, new vscode.Range(
    startPosition,
    endPosition
  ), newStr);
  await vscode.workspace.applyEdit(edit);
};

/**
 * @description Get extension configuration
 */
const getConfiguration = () => {
  const configuration = vscode.workspace.getConfiguration();

  const appid = configuration.get<string>('transform-helper.appid');
  const key = configuration.get<string>('transform-helper.key');
  const time = configuration.get<number>('transform-helper.time');

  return {
    appid,
    key,
    time: time && time > 1000 ? time : 1000
  };
};

/**
 * @description create camel case
 * @param t {TranstionItem} translate string info
 * @returns string
 */
const createCamelCase = (t: TranstionItem) => {
  const words = t.dst.split(' ').map((s: string, i: number) => {
    if (i === 0) {
      return s.toLowerCase();
    }
    return s.slice(0, 1).toUpperCase() + s.slice(1);
  });

  return words.join('');
};

/**
 * @description match the string that needs to be translated
 * @param text string
 * @returns string
 */
const getFilterText = (text: string) => {
  let result = "";
  const reg = /(const|var|let)\s+[\u4e00-\u9fa5]+\s*/;
  const regText = /[\u4e00-\u9fa5]+/;

  const list = reg.exec(text);

  if (list === null || !list.length) {
    return result;
  }

  const matchInfo = regText.exec(list[0]);

  result = matchInfo !== null ? matchInfo[0] : "";

  return result;
};

/**
 * @description translation tools translate strings
 * @param q string
 * @returns string
 */
const getTranslationInfo = async (q: string) => {

  const configInfo = getConfiguration();

  const url = "https://fanyi-api.baidu.com/api/trans/vip/translate";

  const salt = Math.floor(Math.random() * 1000000);
  const appid = configInfo.appid || "20220725001282759";
  const key = configInfo.key || "u225Wr4ihSsCTFfE2kN9";
  const sign = md5(appid + q + salt + key);

  try {
    const { data }: { data: TranstionResult } = await axios.get(url, {
      params: { q, from: "auto", to: "en", appid, salt, sign },
    });
    // return camel case info
    if (data && data.trans_result && data.trans_result.length) {
      return createCamelCase(data.trans_result[0]);
    }
  } catch (e) {
    console.log(e);
  }
  vscode.window.showWarningMessage('Translation failed, please edit again');
  return '';
};
/**
 * @description text document change event
 * @param e vscode.TextDocumentEvent
 * @returns void
 */
const onTextDocumentChange = async (e: vscode.TextDocumentChangeEvent) => {
  // get seletions info
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.selections.length === 0
  ) {
    return;
  }

  for (const s of vscode.window.activeTextEditor.selections) {
    const lineNumber = s.start.line;
    const lineText = e.document.lineAt(lineNumber).text;

    if (isCheckComment(lineText)) {
      return;
    }

    const filterText = getFilterText(lineText);
    if (!filterText) {
      return;
    }

    const text = await getTranslationInfo(filterText);

    if (!text) {
      return;
    }

    replaceLines(lineText, text, e.document.uri, lineNumber);
  }
};

const translateFun = () => {

  const configInfo = getConfiguration();

  vscode.workspace.onDidChangeTextDocument(debounce(onTextDocumentChange, configInfo.time));
};

export default translateFun;
