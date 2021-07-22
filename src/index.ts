import queryString = require("query-string");
import { Base64 } from "js-base64";

function addSpoiler(info: HTMLUListElement, key: string, value: string, options: { url?: string; icon: string }): void {
  const li = document.createElement("li");
  li.classList.add("list-group-item");
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  const i = document.createElement("i");
  i.classList.add("bi");
  i.classList.add("bi-" + options.icon);
  summary.appendChild(i);
  summary.appendChild(document.createTextNode(" "));
  summary.appendChild(document.createTextNode(key));
  details.appendChild(summary);
  if (options.url) {
    const a = document.createElement("a");
    a.href = options.url;
    a.textContent = value;
    details.appendChild(a);
  } else {
    details.appendChild(document.createTextNode(value));
  }
  li.appendChild(details);
  info.appendChild(li);
}

function loadAtCoderProblemsAPI(url: string, info: HTMLUListElement): { [key: string]: string }[] {
  const req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send();
  if (req.status != 200) {
    addSpoiler(info, "error: failed to call API of AtCoder Problems", req.statusText, { icon: "exclamation-triangle" });
    return [];
  }
  return JSON.parse(req.responseText);
}

function lookupAtCoderProblem(url: URL, info: HTMLUListElement): { [key: string]: string } {
  const match = /\/+contests\/+(\w+)\/+tasks\/+(\w+)/.exec(url.pathname);
  if (!match) {
    addSpoiler(info, "error: failed to parse URL", "", { icon: "exclamation-triangle" });
    return {};
  }
  const problemId = match[2];
  const problems = loadAtCoderProblemsAPI("https://kenkoooo.com/atcoder/resources/merged-problems.json", info);
  for (const problem of problems) {
    if (problem["id"] == problemId) {
      return problem;
    }
  }
  addSpoiler(info, "error: problem info is not found in AtCoder Problems", problemId, { icon: "exclamation-triangle" });
  return {};
}

function lookupAtCoderContest(contestId: string, info: HTMLUListElement): { [key: string]: string } {
  const contests = loadAtCoderProblemsAPI("https://kenkoooo.com/atcoder/resources/contests.json", info);
  for (const contest of contests) {
    if (contest["id"] == contestId) {
      return contest;
    }
  }
  addSpoiler(info, "error: contest info is not found in AtCoder Problems", contestId, { icon: "exclamation-triangle" });
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
  if (!problem) {
    return;
  }
  const contest = lookupAtCoderContest(problem["contest_id"], info);
  if (!contest) {
    return;
  }
  const category = getAtCoderProblemCategory(problem["id"]);
  const contestUrl = "https://atcoder.jp/contests/" + contest["id"];
  addSpoiler(info, "Online Judge", "AtCoder", { url: "https://atcoder.jp/", icon: "link-45deg" });
  addSpoiler(info, "Category", category, { icon: "bar-chart-line" });
  addSpoiler(info, "Contest", contest["title"], { url: contestUrl, icon: "link-45deg" });
  addSpoiler(info, "Point", problem["point"], { icon: "bar-chart-line" });
  addSpoiler(info, "Solver Count", problem["solver_count"], { icon: "bar-chart-line" });
  addSpoiler(info, "Problem Title", problem["title"], { url: url.toString(), icon: "link-45deg" });
  addSpoiler(info, "URL", url.toString(), { url: url.toString(), icon: "link-45deg" });
}

function loadCodeforcesAPI(url: string, info: HTMLUListElement): any {
  const req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send();
  if (req.status != 200) {
    addSpoiler(info, "error: failed to call API of Codeforces", req.statusText, { icon: "exclamation-triangle" });
    return [];
  }
  const data = JSON.parse(req.responseText);
  if (data["status"] != "OK") {
    addSpoiler(info, "error: failed to call API of Codeforces", req.responseText, { icon: "exclamation-triangle" });
    return [];
  }
  return data["result"];
}

function lookupCodeforcesProblem(url: URL, info: HTMLUListElement): { [key: string]: any } {
  const match = /\/+contest\/+(\w+)\/+problem\/+(\w+)/.exec(url.pathname);
  if (!match) {
    addSpoiler(info, "error: failed to parse URL", "", { icon: "exclamation-triangle" });
    return {};
  }
  const contestId = match[1];
  const index = match[2];
  const problems: { [key: string]: any }[] = loadCodeforcesAPI("https://codeforces.com/api/problemset.problems", info)["problems"];
  for (const problem of problems) {
    console.log(problem);
    if (problem["contestId"] == contestId && problem["index"] == index) {
      return problem;
    }
  }
  console.log(contestId);
  console.log(index);
  addSpoiler(info, "error: problem info is not found in Codeforces", contestId + ", " + index, { icon: "exclamation-triangle" });
  return {};
}

function lookupCodeforcesContest(contestId: number, info: HTMLUListElement): { [key: string]: any } {
  const contests: { [key: string]: any }[] = loadCodeforcesAPI("https://codeforces.com/api/contest.list", info);
  for (const contest of contests) {
    if (contest["id"] == contestId) {
      return contest;
    }
  }
  return {};
}

function updateInfoCodeforces(info: HTMLUListElement, url: URL): void {
  const problem = lookupCodeforcesProblem(url, info);
  if (!problem) {
    return;
  }
  const contest = lookupCodeforcesContest(problem["contestId"], info);
  if (!contest) {
    return;
  }
  const contestUrl = "https://codeforces.com/contest/" + contest["id"];
  addSpoiler(info, "Online Judge", "Codeforces", { url: "https://codeforces.com/", icon: "link-45deg" });
  addSpoiler(info, "Contest", contest["name"], { url: contestUrl, icon: "link-45deg" });
  addSpoiler(info, "Rating", problem["rating"], { icon: "bar-chart-line" });
  addSpoiler(info, "Type", problem["type"], { icon: "bar-chart-line" });
  addSpoiler(info, "Tags", problem["tags"].join(", "), { icon: "bar-chart-line" });
  addSpoiler(info, "Problem Name", problem["index"] + ". " + problem["name"], { url: url.toString(), icon: "link-45deg" });
  addSpoiler(info, "URL", url.toString(), { url: url.toString(), icon: "link-45deg" });
}

function updateInfoError(info: HTMLUListElement, url: URL): void {
  addSpoiler(info, "error: invalid url", url.toString(), { url: url.toString(), icon: "link-45deg" });
  addSpoiler(info, "Supported Online Judges", "AtCoder, Codeforces", { icon: "exclamation-triangle" });
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
