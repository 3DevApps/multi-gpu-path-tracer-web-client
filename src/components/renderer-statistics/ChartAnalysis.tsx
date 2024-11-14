import { Flex, message, Modal, Tree } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import StaticChart from "./StaticChart";
import { getStoredData, getStoredDataKeys } from "./statisticsDataUtils";

export default function ChartAnalysis({ isModalOpen, setIsModalOpen }: any) {
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const treeData = useMemo(() => {
    const dataKeys = getStoredDataKeys();
    const dataObj: any = {};

    for (const key of dataKeys) {
      dataObj[key] = getStoredData(key);
    }

    return Object.keys(dataObj).map((key) => {
      const data = getStoredData(key);
      return {
        title: key,
        key: key,
        checkable: false,
        children: Object.keys(data).map((category) => {
          return {
            title: category,
            key: `${key}#${category}`,
          };
        }),
      };
    });
  }, []);

  const [selectedKeys, setSelectedKeys] = useState<any>([]);
  const [chartData, setChartData] = useState<any>([]);
  const [chartCategory, setChartCategory] = useState<any>([]);

  const onCheck = useCallback(
    (checkedKeys: any) => {
      if (checkedKeys.length > 2) {
        message.error("Please select only two categories");
        return;
      }

      if (checkedKeys.length > 1) {
        const category1 = checkedKeys[0].split("#")[1];
        const category2 = checkedKeys[1].split("#")[1];
        if (category1 !== category2) {
          message.error("Please select categories from the same data set");
          return;
        }
      }

      setSelectedKeys(checkedKeys);
    },
    [selectedKeys]
  );

  useEffect(() => {
    if (selectedKeys.length === 2) {
      const [key1, key2] = selectedKeys;
      const [
        [resolvedKey1, resolvedCategory1],
        [resolvedKey2, resolvedCategory2],
      ] = [key1.split("#"), key2.split("#")];
      const data1 = getStoredData(resolvedKey1)[resolvedCategory1];
      const data2 = getStoredData(resolvedKey2)[resolvedCategory2];

      const chartData: any = {};
      Object.keys(data1).forEach((key) => {
        chartData[`D1-${key}`] = data1[key].map((point: any) => point.value);
      });

      Object.keys(data2).forEach((key) => {
        chartData[`D2-${key}`] = data2[key].map((point: any) => point.value);
      });

      setChartData(chartData);
      setChartCategory(resolvedCategory1);
    }
  }, [selectedKeys]);

  return (
    <Modal
      title="Chart analysis tool"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      maskClosable={false}
      width={900}
      style={{
        minWidth: "900px",
        paddingTop: "20px",
      }}
    >
      <Flex
        gap="20px"
        justify="space-between"
        style={{
          overflow: "auto",
          height: "calc(100% - 50px)",
        }}
      >
        <Tree
          checkable
          checkedKeys={selectedKeys}
          onCheck={onCheck}
          treeData={treeData}
        />
        <StaticChart data={chartData} ylabel={chartCategory} />
      </Flex>
    </Modal>
  );
}
