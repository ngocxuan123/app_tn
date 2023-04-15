import { Col, Row, Statistic } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import React from 'react';

export const PanelInformation: React.FC<{}> = ({}) => {
  return (
    <Row gutter={16}>
      <Col span={16}>
      <Statistic
              title='Running Count'
              value={1128}
              prefix={<LikeOutlined />}
            />
      </Col>
      <Col span={8}>
        <Row gutter={8}>
          <Col span={12}>
            <Statistic
              title='Feedback'
              value={1128}
              prefix={<LikeOutlined />}
            />
          </Col>
          <Col span={12}>
            <Statistic title='Unmerged' value={93} suffix='/ 100' />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
