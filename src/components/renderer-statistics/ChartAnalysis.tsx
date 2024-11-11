import { Flex, Modal, TreeSelect } from "antd";
import { useCallback, useState } from "react";
import Chart from "./Chart";

const treeData = [
  {
    value: "parent 1",
    title: "parent 1",
    children: [
      {
        value: "parent 1-0",
        title: "parent 1-0",
        children: [
          {
            value: "leaf1",
            title: "my leaf",
          },
          {
            value: "leaf2",
            title: "your leaf",
          },
        ],
      },
      {
        value: "parent 1-1",
        title: "parent 1-1",
        children: [
          {
            value: "sss",
            title: <b style={{ color: "#08c" }}>sss</b>,
          },
        ],
      },
    ],
  },
];

export default function ChartAnalysis({ isModalOpen, setIsModalOpen }: any) {
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const [value, setValue] = useState(undefined);
  const onChange = useCallback((value) => {
    setValue(value);
  }, []);

  return (
    <Modal
      title="Chart analysis tool"
      open={isModalOpen}
      onCancel={closeModal}
      footer={null}
      maskClosable={false}
      width="90%"
    >
      <Flex>
        <TreeSelect
          showSearch
          style={{ width: "100%" }}
          value={value}
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          placeholder="Please select"
          allowClear
          multiple
          treeDefaultExpandAll
          onChange={onChange}
          treeData={treeData}
        />
        <Chart
          data={[
            {
              x: 123,
              y: 123,
            },
          ]}
          ylabel={"dupa"}
        />
      </Flex>
    </Modal>
  );
}
