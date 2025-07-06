function c(data) {
  return data.map((record) => {
    // 步骤 1 & 2: 验证输入并深度克隆 `gd` 对象，以防修改原始数据
    if (!record || typeof record.gd !== "object" || record.gd === null) {
      console.error("输入记录无效或缺少 'gd' 对象。");
      return null;
    }
    // 使用原生JSON方法进行深度克隆
    const gdClone = JSON.parse(JSON.stringify(record.gd));

    // 步骤 3: 定义要过滤的字段集合
    const FILTERED_KEYS = new Set([
      "bl",
      "blab",
      "blb",
      "hashr",
      "psid",
      "pf",
      "ab",
      "cwc",
      "gwt",
      "_$_$_",
    ]);

    /**
     * 递归处理函数，用于过滤和排序
     * @param {any} data - 当前正在处理的数据（对象、数组或基本类型）
     * @returns {any} 处理后的数据
     */
    function processRecursively(data) {
      // 基本情况：如果数据不是对象（例如，是 null 或基本类型），直接返回
      if (data === null || typeof data !== "object") {
        return data;
      }

      // 如果是数组，则递归处理数组中的每个元素
      if (Array.isArray(data)) {
        return data.map((item) => processRecursively(item));
      }

      // 如果是对象，则进行过滤和排序
      const newObj = {};
      const sortedKeys = Object.keys(data).sort(); // 步骤 4: 对键进行字母排序

      for (const key of sortedKeys) {
        // 如果键不在过滤列表中，则将其添加到新对象中
        if (!FILTERED_KEYS.has(key)) {
          newObj[key] = processRecursively(data[key]); // 递归处理其值
        }
      }

      return newObj;
    }

    // 开始对克隆的 'gd' 对象进行递归处理
    return processRecursively(gdClone);
  });
}
