import queryString = require("query-string");
import { Base64 } from "js-base64";

function addSpoiler(
  info: HTMLUListElement,
  key: string,
  value: string,
  url?: string
): void {
  const li = document.createElement("li");
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = key;
  details.appendChild(summary);
  if (url) {
    const a = document.createElement("a");
    a.href = url;
    a.textContent = value;
    details.appendChild(a);
  } else {
    details.appendChild(document.createTextNode(value));
  }
  li.appendChild(details);
  info.appendChild(li);
}

function loadAtCoderProblemsAPI(
  url: string,
  info: HTMLUListElement
): { [key: string]: string }[] {
  const req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send();
  if (req.status != 200) {
    addSpoiler(
      info,
      "error: failed to call API of AtCoder Problems",
      req.statusText
    );
    return [];
  }
  return JSON.parse(req.responseText);
}

function lookupAtCoderProblem(
  url: URL,
  info: HTMLUListElement
): { [key: string]: string } {
  const match = /\/+contests\/+(\w+)\/+tasks\/+(\w+)/.exec(url.pathname);
  if (!match) {
    addSpoiler(info, "error: failed to parse URL", "");
    return {};
  }
  const problemId = match[2];
  const problems = loadAtCoderProblemsAPI(
    "https://kenkoooo.com/atcoder/resources/merged-problems.json",
    info
  );
  for (const problem of problems) {
    if (problem["id"] == problemId) {
      return problem;
    }
  }
  addSpoiler(
    info,
    "error: problem info is not found in AtCoder Problems",
    problemId
  );
  return {};
}

function lookupAtCoderContest(
  contestId: string,
  info: HTMLUListElement
): { [key: string]: string } {
  const contests = loadAtCoderProblemsAPI(
    "https://kenkoooo.com/atcoder/resources/contests.json",
    info
  );
  for (const contest of contests) {
    if (contest["id"] == contestId) {
      return contest;
    }
  }
  addSpoiler(
    info,
    "error: contest info is not found in AtCoder Problems",
    contestId
  );
  return {};
}

function getAtCoderProblemCategory(problemId: string): string {
  if (problemId.includes("abc")) {
    return "ABC";
  } else if (problemId.includes("arc")) {
    return "ARC";
  } else if (problemId.includes("agc")) {
    return "AGC";
  } else {
    return "others";
  }
}

function updateInfoAtCoder(info: HTMLUListElement, url: URL): void {
  const problem = lookupAtCoderProblem(url, info);
  const contest = lookupAtCoderContest(problem["contest_id"], info);
  const category = getAtCoderProblemCategory(problem["id"]);
  const contestUrl = "https://atcoder.jp/contests/" + contest["id"];
  addSpoiler(info, "Online Judge", "AtCoder");
  addSpoiler(info, "Category", category);
  addSpoiler(info, "Contest", contest["title"], contestUrl);
  addSpoiler(info, "Point", problem["point"]);
  addSpoiler(info, "Solver Count", problem["solver_count"]);
  addSpoiler(info, "Problem Title", problem["title"], url.toString());
  addSpoiler(info, "URL", url.toString(), url.toString());
}

function updateInfoCodeforces(info: HTMLUListElement, url: URL): void {
  addSpoiler(info, "Online Judge", "Codeforces");
  addSpoiler(info, "URL", url.toString(), url.toString());
}

function updateInfoError(info: HTMLUListElement, url: URL): void {
  addSpoiler(info, "error: invalid url", url.toString(), url.toString());
  addSpoiler(info, "Supported Online Judges", "AtCoder, Codeforces");
}

function updateInfo(urlStr: string): void {
  // clear info
  const info = document.getElementById("info") as HTMLUListElement;
  while (info.lastChild) {
    info.removeChild(info.lastChild);
  }

  // update info
  const url = new URL(urlStr);
  if (url.hostname.includes("atcoder.jp")) {
    updateInfoAtCoder(info, url);
  } else if (url.hostname.includes("codeforces.com")) {
    updateInfoCodeforces(info, url);
  } else {
    updateInfoError(info, url);
  }
}

function makeUrl(url: string): string {
  const baseUrl = queryString.parseUrl(location.href).url;
  return queryString.stringifyUrl({
    url: baseUrl,
    query: {
      q: Base64.encode(url),
    },
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const config = queryString.parse(location.search);
  if ("q" in config && typeof config["q"] == "string") {
    updateInfo(Base64.decode(config["q"]));
  }

  const inputUrl = document.getElementById("input-url") as HTMLTextAreaElement;
  const button = document.getElementById("submit-button") as HTMLButtonElement;
  const outputUrl = document.getElementById("output-url") as HTMLAnchorElement;
  button.addEventListener("click", function () {
    outputUrl.href = makeUrl(inputUrl.value);
    outputUrl.textContent = outputUrl.href;
    updateInfo(inputUrl.value);
    return false;
  });
});
