import { RunnerProcessDto } from '@src/modules/shared/dtos/OptionRunnerDto';
import React, { useEffect, useRef, useState } from 'react';
import './Application.scss';
import { Layout, theme, Tabs } from 'antd';
import { FormStart } from './forms/FormStart';
import { TabContent } from './tab-content/tab-content';
import { FormProperty } from './forms/form-property';
import { getDateForName } from '@src/modules/shared/utils/utils';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
const { Sider, Content } = Layout;

interface ApplicationProps {
  startProcess: (data: RunnerProcessDto[]) => void;
  stopAll: () => void;
  stopOne: (processIndex: number) => void;
  updateProcess: (callback: any) => void;
  getLogs: (fileName: string) => void;
  receivedLogs: (callback: any) => any;
}

interface WorkerDataProps {
  logFile: string;
  id: string;
  data: FormProperty;
}

const generateData = (
  process: number,
  formData: FormProperty,
): RunnerProcessDto[] => {
  const identity = `${getDateForName()}`;
  return new Array(process).fill(null).map((item, index) => ({
    logFile: `${identity}_${index + 1}.log`,
    id: `${identity}_${index + 1}`,
    data: formData,
  }));
};

const Application: React.FC<ApplicationProps> = ({
  startProcess,
  stopAll,
  stopOne,
  updateProcess,
  getLogs,
  receivedLogs,
}) => {
  const intervalGetLogRef = useRef<any>();
  const [isStarting, setIsStarting] = useState(false);
  const [processData, setProcessData] = useState<RunnerProcessDto[]>([]);
  const [logs, setLogs] = useState<any>();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const onStart = (values: FormProperty) => {
    setIsStarting(true);
    const data = generateData(+values.numberProcess, values);
    setProcessData(data);
    startProcess(data);
    if (intervalGetLogRef.current) {
      clearInterval(intervalGetLogRef.current);
    }
    intervalGetLogRef.current = setInterval(() => {
      getLogs(data?.[0]?.logFile);
    }, 5000);
  };

  const onStopAll = () => {
    setIsStarting(false);
    setProcessData([]);
    stopAll();
    if (intervalGetLogRef.current) {
      clearInterval(intervalGetLogRef.current);
    }
  };

  const onTabChange = (tabKey: string) => {
    const processDataByTab = processData.find((item) => item.id === tabKey);
    if (!processDataByTab) return;
    if (intervalGetLogRef.current) {
      clearInterval(intervalGetLogRef.current);
    }
    getLogs(processDataByTab.logFile);
    intervalGetLogRef.current = setInterval(() => {
      getLogs(processDataByTab.logFile);
    }, 5000);
  };

  useEffect(() => {
    receivedLogs((event: any, data: any) => {
      setLogs(data);
    });

    return () => {
      if (intervalGetLogRef.current) {
        clearInterval(intervalGetLogRef.current);
      }
    };
  }, []);

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} width={320} theme='light'>
        <FormStart
          isStarting={isStarting}
          onStart={onStart}
          onStopAll={onStopAll}
        ></FormStart>
      </Sider>
      <Content
        style={{
          margin: 16,
          padding: 24,
          maxHeight: 'calc(100% - 64px)',
          overflow: 'auto',
          background: colorBgContainer,
        }}
      >
        {processData.length > 0 ? (
          <Tabs
            defaultActiveKey={processData[0].id}
            tabPosition='top'
            onChange={onTabChange}
            items={processData.map((item) => {
              return {
                label: `Tab-${item.id}`,
                key: item.id,
                children: (
                  <div style={{ maxHeight: 600, overflow: 'auto' }}>
                    <TabContent data={logs}></TabContent>
                  </div>
                ),
              };
            })}
          />
        ) : (
          <div>No Data</div>
        )}
      </Content>
    </Layout>
  );
};

export default Application;
