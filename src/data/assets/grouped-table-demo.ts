import type {DSTableColumn} from '../../design-system/primitives/Table'
export interface Person {id:string;name:string;age:number;street:string;building:string;door:string;companyAddress:string;company:string;gender:string}
export const people:Person[]=Array.from({length:24},(_,index)=>({id:String(index+1),name:['周明','赵洁','陈文','李华'][index%4],age:24+index,street:['湖滨路','科创大道'][index%2],building:['A座','B座','C座'][index%3],door:String(2001+index),companyAddress:'科创园区 42 号',company:['启明科技','远山研究院'][index%2],gender:index%2?'女':'男'}))
export const groupedPersonColumns:DSTableColumn<Person>[]=[
 {key:'name',title:'姓名',width:140,fixed:'left'},
 {key:'other',title:'个人信息',children:[
  {key:'age',title:'年龄',width:100,sortable:true},
  {key:'address',title:'居住地址',children:[{key:'street',title:'街道',width:160},{key:'block',title:'楼栋信息',children:[{key:'building',title:'楼栋',width:90},{key:'door',title:'门牌号',width:110}]}]},
 ]},
 {key:'companyGroup',title:'公司信息',children:[{key:'companyAddress',title:'公司地址',width:200},{key:'company',title:'公司名称',width:180}]},
 {key:'gender',title:'性别',width:100,fixed:'right'},
]
