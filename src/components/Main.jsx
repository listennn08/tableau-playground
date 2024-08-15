import { Button, Checkbox, Col, Form, Input, Row, Select, Space, Typography } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { TableauViz } from '../vendor/tableau';
import React from 'react';
import axios from 'axios';

export default function Main() {
  const initialValues = {
    connectedAppClientId: '',
    connectedAppSecretId: '',
    connectedAppClientSecret: '',
    tableauUser: '',
    toolbar: 'hidden',
    width: '1280px',
    height: '600px',
    tableauUrl: '',
    hideTabs: true,
    attributes: [],
    filters: [],
  }
  Object.assign(initialValues, JSON.parse(localStorage.getItem('tableauConfig')))

  const [viz] = React.useState(new TableauViz())
  const [form] = Form.useForm()

  const vizRef = React.useRef(null)

  function handleSaveToLocal() {
    const values = form.getFieldsValue()
    localStorage.setItem('tableauConfig', JSON.stringify(values))
  }

  async function loadViz() {
    const v = await form.validateFields()
    if (!v) {
      return
    }
    const values = form.getFieldsValue()
    viz.src = values.tableauUrl
    viz.hideTabs = values.hideTabs
    viz.toolbar = values.toolbar
    viz.width = values.width
    viz.height = values.height

    const body = JSON.stringify({
      connectedAppClientId: values.connectedAppClientId,
      connectedAppClientSecret: values.connectedAppClientSecret,
      connectedAppSecretId: values.connectedAppSecretId,
      tableauUser: values.tableauUser,
      ...(values.attributes
          .filter((el) => el)
          .reduce((obj, item) => ({
            ...obj,
            [item.key]: item.value,
          }), {}))
    })
    const resp = (
      await axios.post('/token', body, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    ).data
    viz.token = resp.token
    vizRef.current.appendChild(viz)
  }

  return (
    <div>
      <h1>Tableau Embedded Test</h1>
      <Form
        name="config"
        form={form}
        initialValues={{...initialValues}}
        labelCol={{ span: 10 }}
        colon={false}
        autoComplete='off'
      >
        <Row justify="start" gutter={10}>
          <Col span={10}>
            <Form.Item label="Connected App Client ID" name="connectedAppClientId" rules={[{ required: true }]}>
              <Input.Password placeholder="Connected App Client ID" />
            </Form.Item>
            <Form.Item label="Connected App Secret ID" name="connectedAppSecretId" rules={[{ required: true }]}>
              <Input.Password placeholder="Connected App Secret ID" />
            </Form.Item>
            <Form.Item label="Connected App Client Secret" name="connectedAppClientSecret" rules={[{ required: true }]}>
              <Input.Password placeholder="Connected App Secret Key" />
            </Form.Item>
            <Form.Item label="Tableau User" name="tableauUser" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="Tableau User email" />
            </Form.Item>
            <Form.Item label="User Attributes" name="attributes">
              <Form.List name="attributes">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key}>
                        <Form.Item name={[name, 'key']} {...restField}>
                          <Input placeholder="Attribute Name" />
                        </Form.Item>
                        <Form.Item name={[name, 'value']} {...restField}>
                          <Input placeholder="Attribute Value" />
                        </Form.Item>
                        <Form.Item>
                          <CloseOutlined style={{ fontSize: '16px' }} onClick={() => remove(name)} />
                        </Form.Item>
                      </Space>
                    ))}
                    <Button onClick={() => add()}>Add User Attribute</Button>
                  </>
                )}
              </Form.List>
            </Form.Item>
          </Col>

          <Col span={14}>
            <Row justify="center">
              <Col span={8}>
                <Form.Item label="Width" name="width">
                  <Input placeholder="Width" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Height" name="height">
                  <Input placeholder="Height" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Toolbar" name="toolbar">
                  <Select>
                    <Select.Option value="visible">Visible</Select.Option>
                    <Select.Option value="hidden">Hidden</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={4}>
              <Col span={8}>
                <Form.Item label="Hide Tabs" name="hideTabs" valuePropName="checked">
                  <Checkbox>Hide Tabs</Checkbox>
                </Form.Item>
              </Col>

              <Col span={16}>
                <Form.Item label="Tableau Report URL" labelCol={{ span: 8 }} name="tableauUrl" rules={[{ required: true, type: 'url' }]}>
                  <Input placeholder="Tableau Report URL" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              {/* <Col span={14}>
                <Form.Item label="Filter" labelCol={{ span: 6 }} name="filters">
                  <Form.List name="filters">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <>
                            <Space>
                              <Form.Item name={[name, 'key']} {...restField}>
                                <Input placeholder="Filter name" />
                              </Form.Item>
                              <Form.Item name={[name, 'value']} {...restField}>
                                <Input placeholder="Filter value" />
                              </Form.Item>
                              <Form.Item>
                                <Button>Apply Filter</Button>
                              </Form.Item>
                              <Form.Item>
                                <CloseOutlined style={{ fontSize: '16px' }} onClick={() => remove(name)} />
                              </Form.Item>
                            </Space>
                          </>
                        ))}
                        <Button onClick={() => add()}>Add Filter</Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>
              </Col> */}
            </Row>
              
          </Col>
        </Row>
      </Form>
      <Space style={{ marginBottom: '1rem' }}>
        <Button type="primary" onClick={loadViz}>Load Viz</Button>
        <Button onClick={handleSaveToLocal}>Save config to Local</Button>
      </Space>
      <div ref={vizRef}></div>
    </div>
  );
}