import { readFile, writeFile } from "node:fs";
import path from "node:path";
import stripJsonComments from "strip-json-comments";

function clearBaseSlot() {
	// 读取带注释的文件
	const inputFilePath = path.join(import.meta.dir, "../src/slot/index.ts");
	const outputFilePath = path.join(import.meta.dir, "../src/slot/BaseSlot.ts");
	readFile(inputFilePath, "utf8", (err, data) => {
		if (err) {
			console.error("Error reading file:", err);
			return;
		}

		// 移除注释
		const strippedData = stripJsonComments(data);

		// 写入无注释的文件
		writeFile(outputFilePath, strippedData, "utf8", (err) => {
			if (err) {
				console.error("Error writing file:", err);
				return;
			}
			console.log("File has been written successfully.");
		});
	});
}

function clearChikcy() {
	// 读取带注释的文件
	const inputFilePath = path.join(import.meta.dir, "../src/chicky/index.ts");
	const outputFilePath = path.join(import.meta.dir, "../src/chicky/Chicky.ts");
	readFile(inputFilePath, "utf8", (err, data) => {
		if (err) {
			console.error("Error reading file:", err);
			return;
		}

		// 移除注释
		const strippedData = stripJsonComments(data);

		// 写入无注释的文件
		writeFile(outputFilePath, strippedData, "utf8", (err) => {
			if (err) {
				console.error("Error writing file:", err);
				return;
			}
			console.log("File has been written successfully.");
		});
	});
}

(function init() {
	clearBaseSlot();
	clearChikcy();
})();
