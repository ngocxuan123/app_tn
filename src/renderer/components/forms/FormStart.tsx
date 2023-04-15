import {
  Button,
  Form,
  Input,
  Radio,
  Switch,
  Row,
  Col,
  Card,
  Select,
} from 'antd';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { GoLoginProfiles } from './go-login-profile';
import { VMLoginProfiles } from './vm-login-profile';
import { FolderViewOutlined } from '@ant-design/icons';
import { DEFAULT_DRIVER, FormProperty, initValues } from './form-property';

export const FormStart: React.FC<{
  onStart: (values: any) => void;
  onStopAll: () => void;
  isStarting: boolean;
}> = ({ onStart, onStopAll, isStarting }) => {
  const [enableProxier, setEnableProxier] = useState(false);
  const [profileOptions, setProfileOptions] = useState([]);
  const [form] = Form.useForm<FormProperty>();
  const inputFileRef = useRef<HTMLInputElement>();

  const browserDriverWatch = Form.useWatch<keyof typeof DEFAULT_DRIVER>(
    'driver',
    form,
  );

  const onSubmitForm = (values: any) => {
    onStart(values);
  };

  const onDriverConnect = async (event: any) => {
    const { apiUrl, apiKey } = await form.validateFields([
      'apiUrl',
      'apiKey',
      'apiLocalUrl',
    ]);
    switch (browserDriverWatch) {
      case 'VM_LOGIN':
        const { data: vmLoginData } = await axios.get<VMLoginProfiles>(
          `${apiUrl}/profile/list`,
          {
            params: {
              token: apiKey,
            },
          },
        );
        setProfileOptions(
          vmLoginData.data.map((item) => ({
            value: item.sid,
            label: item.name,
            text: item.name,
          })),
        );
        break;
      case 'GO_LOGIN':
        const { data: goLogin } = await axios.get<GoLoginProfiles>(
          `${apiUrl}/v2`,
          {
            headers: {
              Authorization: 'Bearer ' + apiKey,
            },
          },
        );
        setProfileOptions(
          goLogin.profiles.map((item) => ({
            value: item.id,
            label: item.name,
            text: item.name,
          })),
        );
        break;
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      ...DEFAULT_DRIVER[browserDriverWatch],
      profileId: '',
    });
    setProfileOptions([]);
  }, [browserDriverWatch]);

  return (
    <Form
      layout='horizontal'
      size='small'
      style={{ padding: 8 }}
      form={form}
      onFinish={onSubmitForm}
      labelCol={{ style: { width: 100 } }}
      labelAlign='left'
      disabled={isStarting}
      initialValues={initValues}
    >
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <Card title='Browser settings'>
            <Form.Item
              label='Driver'
              name='driver'
              rules={[{ required: true }]}
            >
              <Radio.Group
                value='VM_LOGIN'
                optionType='button'
                buttonStyle='solid'
              >
                <Radio.Button value='VM_LOGIN'>VM-LOGIN</Radio.Button>
                <Radio.Button value='GO_LOGIN'>GO-LOGIN</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label='Url' name='apiUrl' rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label='Token' name='apiKey' rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label='Local Url'
              name='apiLocalUrl'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label='Proxier' name='proxier' valuePropName='checked'>
              <Row justify='space-between'>
                <Col>
                  <Switch
                    onChange={(checked) => {
                      setEnableProxier(checked);
                      form.setFieldValue('numberProcess', checked ? 1 : 5);
                      form.setFieldValue('proxier', checked);
                    }}
                  />
                </Col>
                <Col>
                  <Button
                    size='small'
                    type='primary'
                    disabled={!enableProxier || isStarting}
                    htmlType='button'
                    shape='round'
                    onClick={onDriverConnect}
                  >
                    Connect
                  </Button>
                </Col>
              </Row>
            </Form.Item>
            <Form.Item
              label='Profile'
              name='profileId'
              // rules={[{ required: enableProxier }]}
            >
              <Select
                showSearch
                disabled={!enableProxier || isStarting}
                options={profileOptions}
                optionFilterProp='label'
              />
            </Form.Item>
            <Form.Item
              label='Proxier path'
              name='proxierPath'
              rules={[{ required: enableProxier }]}
            >
              <Input
                disabled={!enableProxier || isStarting}
                suffix={
                  <FolderViewOutlined
                    onClick={() => inputFileRef.current.click()}
                  />
                }
              />
            </Form.Item>
            <input
              {...{webkitdirectory: true, }}
              type='file'
              hidden
              style={{ display: 'none' }}
              ref={inputFileRef}
              onChange={(event) => {
                form.setFieldValue('proxierPath', event.target.files?.[0]?.path.replaceAll('\\', '/').split('/').slice(0, -1).join('/'))
                form.validateFields(['proxierPath']);
              }
                
              }
            ></input>
          </Card>
        </Col>
        <Col span={24}>
          <Card title='Textnow Setting'>
            <Form.Item
              label='Thread'
              name='numberProcess'
              rules={[{ required: true }]}
            >
              <Input disabled={isStarting || enableProxier} />
            </Form.Item>
            <Form.Item
              label='Main URL'
              name='host'
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label='Max Retry' name={['options', 'retry']}>
              <Input />
            </Form.Item>
            <Form.Item label='Timeout (s)' name={['options', 'timeout']}>
              <Input />
            </Form.Item>
          </Card>
        </Col>
        <Col span={24}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Button
                type='primary'
                disabled={isStarting}
                htmlType='submit'
                block
              >
                Start
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type='primary'
                danger
                disabled={!isStarting}
                htmlType='button'
                block
                onClick={() => onStopAll()}
              >
                Stop
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  );
};
