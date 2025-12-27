import React, { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { BookOutlined, SearchOutlined } from '@ant-design/icons'
import realApi from '../../api/realApi'
import type { Student, Course } from '../../types/api'

const StudentManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [department, setDepartment] = useState('')

  // Course Assignment Modal
  const [isCourseModalVisible, setIsCourseModalVisible] = useState(false)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([])

  const fetchStudents = async (page = 1) => {
    setLoading(true)
    try {
      const data = await realApi.getStudents({
        page,
        pageSize: 10,
        keyword,
        department,
      })
      setStudents(data.items)
      setTotal(data.total)
      setCurrentPage(page)
    } catch (error) {
      message.error('获取学生列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      // Fetch all courses (assuming < 100 for now, or implement search in modal)
      const data = await realApi.getCourses({ page: 1, pageSize: 100 })
      setAllCourses(data.items)
    } catch (error) {
      message.error('获取课程列表失败')
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleAssignCourses = (student: Student) => {
    setCurrentStudent(student)
    setSelectedCourseIds(student.courseIds || [])
    if (allCourses.length === 0) {
      fetchCourses()
    }
    setIsCourseModalVisible(true)
  }

  const handleSaveCourses = async () => {
    if (!currentStudent) return
    try {
      await realApi.setStudentCourses(currentStudent.id, selectedCourseIds)
      message.success('课程分配成功')
      setIsCourseModalVisible(false)
      fetchStudents(currentPage)
    } catch (error) {
      message.error('课程分配失败')
    }
  }

  const columns: ColumnsType<Student> = [
    {
      title: '姓名',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '学院/部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '已选课程',
      key: 'courses',
      render: (_, record) => (
        <Space size={[0, 8]} wrap>
          {record.courseNames && record.courseNames.length > 0 ? (
            record.courseNames.map((name) => (
              <Tag color="blue" key={name}>
                {name}
              </Tag>
            ))
          ) : (
            <Tag>无课程</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="分配课程">
            <Button
              type="text"
              icon={<BookOutlined />}
              onClick={() => handleAssignCourses(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="学生管理"
        extra={<span>管理学生选课信息</span>}
      >
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索姓名/用户名/邮箱"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => fetchStudents(1)}
            style={{ width: 200 }}
          />
          <Input
            placeholder="搜索学院"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            onPressEnter={() => fetchStudents(1)}
            style={{ width: 150 }}
          />
          <Button type="primary" onClick={() => fetchStudents(1)}>
            搜索
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            total: total,
            pageSize: 10,
            onChange: (page) => fetchStudents(page),
          }}
        />
      </Card>

      {/* 课程分配模态框 */}
      <Modal
        title={`分配课程 - ${currentStudent?.fullName}`}
        open={isCourseModalVisible}
        onOk={handleSaveCourses}
        onCancel={() => setIsCourseModalVisible(false)}
      >
        <p>请选择该学生所属的课程：</p>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="选择课程"
          value={selectedCourseIds}
          onChange={setSelectedCourseIds}
          optionFilterProp="label"
          options={allCourses.map((course) => ({
            label: `${course.name} (${course.code})`,
            value: course.id,
          }))}
        />
      </Modal>
    </div>
  )
}

export default StudentManagementPage
