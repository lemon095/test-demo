import { readFile, writeFile } from "node:fs";
import path from "node:path";
import stripJsonComments from "strip-json-comments";

function clearBaseSlot() {
	// 读取带注释的文件
	const paths = ["../src/slot/index.ts", "../src/slot/RnsAdapter.ts"];
	const output = [
		"../src/slot/output/BaseSlot.ts",
		"../src/slot/output/RnsAdapter.ts",
	];
	paths.forEach((_path, i) => {
		const inputFilePath = path.join(import.meta.dir, _path);
		const outputFilePath = path.join(import.meta.dir, output[i]);
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
