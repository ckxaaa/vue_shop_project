<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item >订单列表</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单管理列表视图 -->
      <el-table border style="width: 100%" stripe :data="goodsList">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column
        prop="order_number"
        label="订单编号">
        </el-table-column>
        <el-table-column
        prop="order_price"
        label="订单价格" width="75px">
        </el-table-column>
        <el-table-column
        label="是否付款" width="100px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
        prop="is_send"
        label="是否发货" width="75px">
        </el-table-column>
        <el-table-column
        prop="create_time"
        label="下单时间">
        <template slot-scope="scope">
            {{scope.row.create_time | dataFormat}}
        </template>
        </el-table-column>
        <el-table-column
        label="操作">
          <template >
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editdialogVisible = true">编辑</el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="getLocationInfo" >物流信息</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页操作 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 编辑订单对话框 -->
    <el-dialog
      title="订单管理"
      :visible.sync="editdialogVisible"
      width="50%"
      @close="handleClose">
      <el-form ref="editOrderref" :model="editOrderForm" :rules="editOrderFormRules" label-width="100px">
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
            v-model="editOrderForm.address1"
            :options="citydata"
            :props="{ expandTrigger: 'hover' }"></el-cascader>
          </el-form-item>
          <el-form-item label="具体地址" prop="address2">
            <el-input v-model="editOrderForm.address2"></el-input>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editdialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流对话框 -->
    <el-dialog
      title="物流管理"
      :visible.sync="localialogVisible"
      width="50%">
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in locationList"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data () {
    return {
      goodsList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      editOrderForm: {
        address1: [],
        address2: ''
      },
      editdialogVisible: false,
      editOrderFormRules: {
        address1: [
          { required: true, message: '请选择地区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写具体地址', trigger: 'blur' }
        ]
      },
      citydata,
      localialogVisible: false,
      locationList: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
      this.$message.success('获取订单列表成功')
      console.log(this.goodsList)
    },
    // 改变每页显示条数
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 改变页码
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 关闭对话框事件
    handleClose () {
      this.$refs.editOrderref.resetFields()
    },
    // 获取物流信息
    async getLocationInfo () {
      const { data: res } = await this.$http.get(`kuaidi/${1106975712662}`)
      if (res.meta.status !== 200) return this.$message.error('获取物流信息出错')
      this.$message.success('获取物流信息')
      this.locationList = res.data
      console.log(this.locationList)
      this.localialogVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
// 导入时间线样式
// @import '../../plugins/timeline/timeline.css';
// @import '../../plugins/timeline-item/timeline-item.css';
.el-cascader {
  width: 100%
}
</style>
