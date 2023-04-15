import React from 'react';
import { ILogContentDataProps, LogContent } from './log-content';
import { Col, Row } from 'antd';
import { PanelInformation } from './panel-information';
import { Content } from 'antd/es/layout/layout';

interface TabContentProps {
  overview?: any;
  data?: ILogContentDataProps[];
  inputId?: string;
}

export const TabContent: React.FC<TabContentProps> = ({
  overview,
  data,
  inputId,
}) => {
  return (
    <Content style={{overflow: 'hidden'}}>
      <Row gutter={8}>
        <Col span={24}>
          <PanelInformation />
        </Col>
        <Col span={24}>
          <LogContent data={data}></LogContent>
        </Col>
      </Row>
    </Content>
  );
};
