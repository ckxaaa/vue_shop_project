<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 商品列表卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <!-- 搜索添加视图 -->
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-row>
        <!-- 商品列表视图 -->
        <el-table
        :data="goodsList"
        border
        stripe
        style="width: 100%">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column
        prop="goods_name"
        label="名称">
        </el-table-column>
        <el-table-column
        prop="goods_price"
        width="75"
        label="商品价格(元)">
        </el-table-column>
        <el-table-column
        prop="goods_weight"
        label="商品重量"
        width="65">
        </el-table-column>
        <el-table-column
        prop="add_time"
        label="创建时间"
        width="150px">
          <template slot-scope="scope">
            {{scope.row.add_time | dataFormat}}
          </template>
        </el-table-column>
          <el-table-column
          label="操作"
          width="180">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" icon="el-icon-edit" size="mini" @click="delectgoods(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页视图 -->
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background>
        </el-pagination>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      goodsList: [],
      total: 0,
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) this.message.error('获取商品列表失败')
      this.$message.success('获取商品列表成功')
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
    },
    // 改变每页显示操作
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    // 切换页数
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoodsList()
    },
    delectgoods (delInfo) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(`goods/${delInfo.goods_id}`)
        if (res.meta.status !== 200) return this.$http.error('删除商品失败')
        this.$message.success('删除商品成功')
        this.getGoodsList()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 点击添加按钮跳转到添加商品的页面
    goAddGoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>
