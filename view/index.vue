<template>
    <div class="allocation">
        <div class="loading-container">
            <Spin fix size="large" v-if="loading" />
            <vxeTableUltra ref="xGrid" :gridOptions="viewOptions" :seq-config="{ startIndex: (Number(current) - 1) * 10 }">
                <template #buttons>
                    <div class="btnWrap">
                        <Button type="primary" @click="handleAdd" icon="md-add">创建调拨申请单</Button>
                    </div>
                </template>
                <template #manageType="{ row }">
                    <TableSlot type="manageType" :data="row"></TableSlot>
                </template>
                <template #state="{ row }">
                    <span>{{ transformaState(row.allocateState) }}</span>
                </template>
                <template #handle="{ row }">
                    <div class="btnGroup">
                        <div v-if="row.allocateState === 2">
                            <Button class="btn" type="text" @click="handleEdit(row)" icon="md-create" ghost>编辑</Button>
                            <Button class="btn" type="text" @click="handleShutAllocate(row)" icon="md-close"
                                ghost>作废</Button>
                        </div>
                        <div v-else>
                            <Button class="btn" type="text" @click="handleDetail(row)" icon="md-eye" ghost>详情</Button>
                            <Button class="btn" :class="row.allocateState !== 3 ? 'disabled' : ''"
                                :disabled="row.allocateState !== 3" type="text" @click="handleRevoke(row)" icon="md-redo"
                                ghost>撤销</Button>
                        </div>
                    </div>
                </template>
                <template #pager>
                    <Page :total="total" :current="current" @on-change="pageChange" show-total show-elevator />
                </template>
            </vxeTableUltra>
            <template #state="{ row }">
                <span>{{ transformaState(row.allocateState) }}</span>
            </template>
            <template #handle="{ row }">
                <div class="btnGroup">
                    <div v-if="row.allocateState === 2">
                        <Button class="btn" shape="circle" type="success" @click="handleEdit(row)"
                            icon="md-create">编辑</Button>
                        <Button class="btn" shape="circle" type="error" @click="handleShutAllocate(row)"
                            icon="md-close">作废</Button>
                    </div>
                    <div v-else>
                        <Button class="btn" shape="circle" type="primary" @click="handleDetail(row)"
                            icon="md-eye">详情</Button>
                        <Button class="btn" shape="circle" :disabled="row.allocateState !== 3" type="warning"
                            @click="handleRevoke(row)" icon="md-redo">撤销</Button>
                    </div>
                </div>
            </template>
            <template #pager>
                <Page :total="total" :current="current" @on-change="pageChange" show-total show-elevator />
            </template>
            </vxe-grid> -->
        </div>
        <AddOrEdit ref="addOrEdit" :isShow.sync="showAddOrEdit" :typeCodeList="typeCodeList" :warehouseList="warehouseList"
            @search="getAllocate" />
        <Detail ref="detail" :isShow.sync="showDetail" :stateList="stateList" />
    </div>
</template>
<script>
import {
    getAllocate,
    revokeAllocate,
    shutAllocate
} from '@/api/allocation/index.js'
import { getWarehouseList } from '@/api/exWarehouse/outboundTask'
import { getOrderWarehouse } from '@/api/entryWarehouse/index.js'
import AddOrEdit from './components/addOrEdit.vue'
import Detail from './components/detail.vue'
import EmployeeSelect from '@/view/module/entryWarehouse/components/EmployeeSelect.vue'
import vxeTableUltra from '@/components/vxeTableUltra'
import TableSlot from '@/components/Table-slot'
export default {
    name: 'allocationIndex',
    components: {
        AddOrEdit,
        Detail,
        EmployeeSelect,
        vxeTableUltra,
        TableSlot
    },
    data() {
        return {
            // 当前页
            current: 1,
            // 总条数
            total: 0,
            // 当前页大小（默认10）
            size: '10',
            // 搜索表单
            searchForm: {
                outWarehouseId: '',
                outOrderWarehouseId: '',
                inWarehouseId: '',
                inOrderWarehouseId: '',
                allocateCode: '',
                allocateState: 101,
                createDate: '',
                createUserName: '',
                allocateTypeCode: ''
            },
            // 部门仓库列表
            warehouseList: [],
            outOrderWarehouseList: [],
            inOrderWarehouseList: [],
            stateList: [
                {
                    value: 101,
                    name: '未完成'
                },
                {
                    value: 102,
                    name: '已完成'
                },
                {
                    value: 103,
                    name: '全部'
                }
            ],
            typeCodeList: [
                {
                    value: 'ALLOCATE_TYPE_001',
                    name: '内部转仓'
                },
                {
                    value: 'ALLOCATE_TYPE_002',
                    name: '内仓转外仓'
                },
                {
                    value: 'ALLOCATE_TYPE_003',
                    name: '外仓转内仓'
                }
            ],
            // 可拖拽表格配置
            viewOptions: {
                slotList: [{ name: 'state' }, { name: 'handle' }, { name: 'buttons' }, { name: 'pager' }, { name: 'manageType' }],
                gridOptions: {
                    // id一定要加并且不能重复
                    id: 'wmsAllocation',
                    border: true,
                    resizable: true,
                    showHeaderOverflow: true,
                    align: 'center',
                    rowConfig: {
                        isHover: true
                    },
                    editConfig: {
                        trigger: 'click',
                        mode: 'cell'
                    },
                    // 必须添加此对象配置否则无法显示工具栏
                    toolbarConfig: {
                        custom: true,
                        slots: {
                            buttons: 'buttons'
                        }
                    },
                    // 必须添加此对象配置否则拖拉拽异常
                    columnConfig: { useKey: true },
                    columns: [
                        { type: 'seq', title: '序号', width: 60 },
                        { field: 'outOrderWarehouseName', title: '出库存货仓库' },
                        { field: 'inOrderWarehouseName', title: '入库存货仓库' },
                        { field: 'allocateCode', title: '调拨单号' },
                        { field: 'createUserName', title: '制单人' },
                        { field: 'createDate', title: '制单日期' },
                        { field: 'allocateTypeName', title: '调拨类型' },
                        {
                            field: 'manageType', title: '管理类型', slots: { default: 'manageType' }
                        },
                        {
                            field: 'allocateState',
                            title: '状态',
                            slots: { default: 'state' }
                        },
                        { title: '操作', slots: { default: 'handle' }, width: 200 }
                    ],
                    data: []
                },
            },
            // 表格配置
            gridOptions: {
                id: 'wmsAllocation',
                border: true,
                resizable: true,
                showHeaderOverflow: true,
                align: 'center',
                rowConfig: {
                    isHover: true
                },
                editConfig: {
                    trigger: 'click',
                    mode: 'cell'
                },
                columns: [
                    { type: 'seq', title: '序号', width: 60 },
                    { field: 'outOrderWarehouseName', title: '出库存货仓库' },
                    { field: 'inOrderWarehouseName', title: '入库存货仓库' },
                    { field: 'allocateCode', title: '调拨单号' },
                    { field: 'createUserName', title: '制单人' },
                    { field: 'createDate', title: '制单日期' },
                    { field: 'allocateTypeName', title: '调拨类型' },
                    {
                        field: 'manageType', title: '管理类型', formatter: ({ cellValue }) => {
                            if (cellValue === 1) {
                                return "标签码管理"
                            } else {
                                return "条形码管理"
                            }
                        }
                    },
                    {
                        field: 'allocateState',
                        title: '状态',
                        slots: { default: 'state' }
                    },
                    { title: '操作', slots: { default: 'handle' }, width: 200 }
                ],
                data: []
            },
            showAddOrEdit: false,
            showDetail: false,
            loading: false
        }
    },
    mounted() {
        this.handleSearch()
        this.getWarehouse()
    },
    // 当缓存组件被激活的时候执行
    activated() {
        this.handleSearch()
    },
    methods: {
        /**
         * @description: 作废确认
         * @author: huangyuhang
         * @Date: 2022-11-16 15:07:25
         * @param {*} row
         */
        handleShutAllocate(row) {
            this.$Modal.confirm({
                title: '作废确认',
                content:
                    `<p>WMS已经准备好作废调拨单【${row.allocateCode}】</p><p>调拨单关闭后，将无法重新编辑调拨单内容。您确认要关闭该调拨单吗？</p>`,
                loading: true,
                // 用户点击确认
                onOk: () => {
                    shutAllocate({ allocateId: row.id })
                        .then(res => {
                            this.$Modal.remove()
                            if (res.code === 0) {
                                this.$Message.success('作废成功')
                                this.getAllocate()
                            } else {
                                this.$Message.error(res.message || '作废失败')
                            }
                        })
                        .catch(() => {
                            this.$Modal.remove()
                        })
                }
            })
        },
        /**
         * @description: 撤销确认
         * @author: huangyuhang
         * @Date: 2022-11-16 15:07:53
         * @param {*} row
         */
        handleRevoke(row) {
            if (row.allocateState !== 3) return
            this.$Modal.confirm({
                title: '撤销确认',
                content:
                    `<p>WMS已经准备好撤销调拨单【${row.allocateCode}】</p><p>调拨单撤销后，对应的出入库任务单将被撤销。您确认要撤销该调拨单吗？</p>`,
                loading: true,
                // 用户点击确认
                onOk: () => {
                    revokeAllocate({ allocateId: row.id })
                        .then(res => {
                            this.$Modal.remove()
                            if (res.code === 0) {
                                this.$Message.success('撤销成功')
                                this.getAllocate()
                            } else {
                                this.$Message.error(res.message || '撤销失败')
                            }
                        })
                        .catch(() => {
                            this.$Modal.remove()
                        })
                }
            })
        },
        /**
         * @description: 展开详情
         * @author: huangyuhang
         * @Date: 2022-11-16 15:08:16
         * @param {*} row
         */
        handleDetail(row) {
            this.$refs.detail.init(row)
            this.showDetail = true
        },
        /**
         * @description: 展开编辑
         * @author: huangyuhang
         * @Date: 2022-11-16 15:08:40
         * @param {*} row
         */
        handleEdit(row) {
            this.$refs.addOrEdit.init(row)
            this.showAddOrEdit = true
        },
        /**
         * @description: 展开创建页面
         * @author: huangyuhang
         * @Date: 2022-11-16 15:08:49
         */
        handleAdd() {
            this.$refs.addOrEdit.init()
            this.showAddOrEdit = true
        },
        /**
         * @description: 获取部门仓库列表
         * @author: huangyuhang
         * @Date: 2022-11-16 15:09:29
         */
        getWarehouse() {
            const params = {
                deptId: this.$store.state.user.departmentId == 0 ? null : this.$store.state.user.departmentId
            }
            // 解除部门限制不传参
            getWarehouseList().then(res => {
                this.warehouseList = res.data || [];
            })
        },
        /**
         * 部门仓库发生改变
         */
        warehouseChange(val, type) {
            let params = {
                warehouseId: val
            }
            this.searchForm.orderWarehouseIds = []
            this.orderWarehouseList = []
            if (!val) return
            getOrderWarehouse(params).then(res => {
                if (type === 1) {
                    this.searchForm.outOrderWarehouseId = ''
                    this.outOrderWarehouseList = res.data || []
                } else {
                    this.searchForm.inOrderWarehouseId = ''
                    this.inOrderWarehouseList = res.data || []
                }
            })
        },
        handleSearch() {
            this.current = 1
            this.getAllocate()
        },
        handleReset() {
            this.$refs.searchForm.resetFields()
            this.searchForm.allocateState = 101;
            this.$refs.EmployeeSelect.reset();

            this.handleSearch()
        },
        pageChange(val) {
            this.current = val
            this.getAllocate()
        },
        /**
         * @description: 页大小发生改变
         * @author: huangyuhang
         * @Date: 2022-11-16 15:05:23
         * @param {*} pageSize
         */
        pageSizeChange(pageSize) {
            this.size = pageSize;
            this.handleSearch();
        },
        /**
         * @description: 获取调拨单列表
         * @author: huangyuhang
         * @Date: 2022-11-16 14:58:00
         */
        getAllocate() {
            // 激活加载中
            this.loading = true;
            // 传参
            let params = {
                // 当前页
                current: this.current,
                // 页大小
                size: this.size,
                ...this.searchForm
            }
            // 调接口
            getAllocate(params).then(res => {
                // 关闭加载动画
                this.loading = false;
                // 判断数据是否为空
                if (Object.keys(res.data).length === 0) { this.gridOptions.data = []; this.viewOptions.gridOptions.data = []; this.total = 0; return }
                // 赋值表格数据
                this.gridOptions.data = res.data.list
                this.viewOptions.gridOptions.data = res.data.list
                // 总数
                this.total = res.data.total * 1
            }, err => {
                // 发生错误时触发 关闭加载动画
                this.loading = false;
                // 置空列表数据
                this.gridOptions.data = [];
            })
        },
        changeTime(val) {
            this.searchForm.createDate = val
        },
        transformaState(val) {
            let txt = ''
            switch (val) {
                case 5:
                    txt = '已完成'
                    break
                case 1:
                    txt = '已完成'
                    break
                case 2:
                    txt = '未完成'
                    break
                case 3:
                    txt = '未完成'
                    break
                case 4:
                    txt = '未完成'
                    break
            }
            return txt
        }
    }
}
</script>
  
<style lang='less' scoped>
.allocation {
    .loading-container {
        position: relative;
        margin-top: 10px;
    }

    .btnGroup {
        display: flex;
        justify-content: space-evenly;

        .btn:first-child {
            margin-right: 10px;
        }

        .btn {
            color: #2d8cf0;

            /deep/span {
                display: inline-block;
                vertical-align: text-top;
            }
        }

        .btn:disabled {
            color: #c5c8ce;
        }
    }
}</style>
  