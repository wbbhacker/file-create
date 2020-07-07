#!/usr/bin/env node
const fs = require('fs')
const path = require('path')


const log = require('ololog').maxDepth(2).noFancy
const _ = require('lodash')
const clear = require('clear')   //清空terminal
const chalk = require('chalk') //彩色输出
const figlet = require('figlet') //生成字符团
const inquirer = require('inquirer') //创建交互式的命令行界面
const del = require('del')

const parser = require('@babel/parser')
const generate = require('@babel/generator')
const t = require('@babel/types')
const traverse  = require('@babel/traverse').default

const cwd = process.cwd()
const a = process.pro

// 清空信息
clear();
console.log(
  chalk.yellow(
    figlet.textSync('filec', { horizontalLayout: 'full' })
  )
);

// 获取配置
const configPath = path.resolve(cwd,'file.config.js')
if (!fs.existsSync(configPath)){
  console.error('Not find file.config.js file') 
  return
} 
let config = {
  // default config
}

const loadConfig = require(configPath).config //TODO 动态读取配置file.config
config = {...config,...loadConfig}


let userInputData
// 模板copy任务

let questions = config.template.source_data.map((dataItem) => {
  return {
    name: dataItem.questionfield,
    type:'input',
    message: dataItem.questtionMessage
  }
})

const copyTask = async ()=>{
  // 获取用户输入内容
  userInputData = await inquirer.prompt(questions)


  // 清空dest_path 目录

  config.template.files.forEach(async (item)=>{

    const destFilePath = path.resolve(cwd, item.dest_path, `${userInputData.name}${path.parse(item.soucre_path).ext}`)
    const sourceFilePath = path.resolve(cwd, item.soucre_path)
    const destFilePathDir = path.parse(destFilePath).dir

    // 清空文件
    if (fs.existsSync(destFilePath)) await del([destFilePath])
    
    const dataString = fs.readFileSync(sourceFilePath, { encoding: 'UTF-8' })
    const newString = dataString.replace(/\<\$(.+)\$\>/gm,function(value,s1){
      return userInputData[s1.trim()]
    })

    // 写入
    if (!fs.existsSync(destFilePathDir)) fs.mkdirSync(destFilePathDir)
    fs.writeFileSync(destFilePath, newString ,(err) => {
      if (err) throw err;
    })

  })

}

const modifyTask = async ()=>{
  config.change_files.forEach((item)=>{
    // js 转 ast
    const data = fs.readFileSync(path.resolve(cwd, item.soucre_path), { encoding: 'UTF-8' })
    const ast = parser.parse(data, { sourceType: 'module' })

    // transform
    item.transform_fn(ast, traverse, t, parser , userInputData)

    // ast 转 js
    const source = generate.default(ast.program, {})
    fs.writeFileSync(path.resolve(cwd, item.dest_path), source.code)
  })
}


const tasks = async ()=>{
  await copyTask()
  await modifyTask()
}

tasks()
