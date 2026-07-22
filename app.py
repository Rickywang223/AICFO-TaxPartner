#!/usr/bin/env python3
"""
AI CFO · AI原生交互版
智能税务合伙人 —— 对话即界面
"""
import json
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ai-cfo-next-secret'

# ========================================
# 模拟数据
# ========================================
AGENTS = [
    {
        'id': 'agent-assistant',
        'icon': '👩‍💼',
        'name': '杨姐的税务助理',
        'role': '你的个人税务管家',
        'status': 'urgent',
        'badge': '3项紧急',
        'summary': '今天有3件事需要处理',
        'greeting': '早，杨姐。今天有3件事需要你关注：\n1️⃣ 🔴 3张高危发票即将过期（苏宁电器¥456,000·还剩8天）\n2️⃣ 🟠 华中区认证率45%（低于集团均值26个百分点）\n3️⃣ 🟠 距申报截止还有12天（23家未申报）\n\n要先处理哪个？',
        'style': 'professional',
        'tasks': [
            {'id': 't1', 'label': '先看发票', 'intent': 'show_expiring'},
            {'id': 't2', 'label': '分析华中区', 'intent': 'analyze_region', 'params': {'region': '华中区'}},
            {'id': 't3', 'label': '催未申报公司', 'intent': 'urge_unfiled'},
        ],
        'placeholder': '问AI：今天有什么紧急的？',
    },
    {
        'id': 'agent-certify',
        'icon': '📄',
        'name': '发票认证专员',
        'role': '专注进项发票认证',
        'status': 'warning',
        'badge': '45%完成',
        'summary': '还剩23张待认证',
        'greeting': '你好，当前认证进度41.4%，剩余1,937,407张未认证。\n距截止还有12天，今日需认证87,000张。\n\n有3张高危发票建议优先处理：\n• 苏宁电器 ¥456,000\n• 雪峰致远 ¥12,300\n• 华中·第1分公司 ¥1,200\n\n要开始处理吗？',
        'style': 'concise',
        'tasks': [
            {'id': 't1', 'label': '一键认证高危发票', 'intent': 'certify_urgent'},
            {'id': 't2', 'label': '查看认证趋势', 'intent': 'show_cert_trend'},
            {'id': 't3', 'label': '按区域分析', 'intent': 'analyze_by_region'},
        ],
        'placeholder': '问认证专员：认证进度、异常发票...',
    },
    {
        'id': 'agent-risk',
        'icon': '⚠️',
        'name': '风险预警官',
        'role': '合规风险监控',
        'status': 'urgent',
        'badge': '2家高危',
        'summary': '新增1家风险公司',
        'greeting': '⚠️ 风险扫描完成，发现以下问题：\n\n🔴 高危·2家\n• 华中·第1分公司 — 风险分92\n  特征：开票量环比+340%，金额避线\n• 深圳·南山分公司 — 风险分85\n  特征：餐饮店开"办公用品"发票38张\n\n🟠 预警·5家\n建议本周内完成排查。',
        'style': 'professional',
        'tasks': [
            {'id': 't1', 'label': '查看高危详情', 'intent': 'show_high_risk'},
            {'id': 't2', 'label': '生成审计底稿', 'intent': 'gen_audit_paper'},
            {'id': 't3', 'label': '导出风险报告', 'intent': 'export_risk_report'},
        ],
        'placeholder': '问预警官：风险公司、稽查建议...',
    },
    {
        'id': 'agent-declare',
        'icon': '📋',
        'name': '申报管家',
        'role': '申报进度管理',
        'status': 'normal',
        'badge': '96%完成',
        'summary': '距截止还有12天',
        'greeting': '📋 7月申报进度：\n\n✅ 增值税 — 577/600（96.2%）\n🟠 所得税 — 312/600（52.0%）— 截止18日\n✅ 附加税 — 520/600（86.7%）\n\n🔴 未申报：23家\n• 华中区 12家\n• 华南区 8家\n• 华北区 3家\n\n需要我催一下吗？',
        'style': 'concise',
        'tasks': [
            {'id': 't1', 'label': '催未申报公司', 'intent': 'urge_unfiled'},
            {'id': 't2', 'label': '查看申报明细', 'intent': 'show_decl_detail'},
            {'id': 't3', 'label': '导出未申报清单', 'intent': 'export_unfiled_list'},
        ],
        'placeholder': '问管家：申报进度、催办...',
    },
    {
        'id': 'agent-compliance',
        'icon': '🔍',
        'name': '稽查合规师',
        'role': '深度合规分析',
        'status': 'warning',
        'badge': '新预警',
        'summary': '税负率1.78%正常',
        'greeting': '📊 本月合规健康检查：\n\n💰 税负率分析\n• 增值税预估：¥1,600万（环比+5.2%）\n• 税负率1.78%（行业基准1.5-2.0%）✅ 正常\n\n📄 合规评分：B级 62分\n• 进项认证率41.4%（拖后腿）\n• 过期损失¥315万\n\n💡 建议：华中区认证率提升至70%，可多抵扣¥56万',
        'style': 'professional',
        'tasks': [
            {'id': 't1', 'label': '查看合规报告', 'intent': 'show_compliance_report'},
            {'id': 't2', 'label': '税负趋势分析', 'intent': 'show_tax_trend'},
            {'id': 't3', 'label': '生成审计底稿', 'intent': 'gen_audit_paper'},
        ],
        'placeholder': '问合规师：税负分析、合规检查...',
    },
]

# 对话历史缓存（内存，重启丢失）
conversations = {}

@app.route('/')
def index():
    return render_template('index.html', agents=AGENTS)

@app.route('/api/agent/<agent_id>', methods=['GET'])
def get_agent(agent_id):
    agent = next((a for a in AGENTS if a['id'] == agent_id), None)
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    return jsonify(agent)

@app.route('/api/agents', methods=['GET'])
def get_agents():
    return jsonify(AGENTS)

@app.route('/api/chat/<agent_id>', methods=['POST'])
def chat(agent_id):
    agent = next((a for a in AGENTS if a['id'] == agent_id), None)
    if not agent:
        return jsonify({'error': 'Agent not found'}), 404
    
    data = request.json
    user_message = data.get('message', '')
    context = data.get('context', {})
    
    # 简单的规则引擎回复（后续对接LLM）
    reply = generate_reply(agent_id, user_message, context)
    
    return jsonify({
        'reply': reply,
        'agent': agent_id,
    })

def generate_reply(agent_id, message, context):
    """简单规则引擎——后续替换为LLM"""
    msg = message.lower()
    
    if '认证' in msg or 'certify' in msg:
        return {
            'type': 'action_result',
            'text': '✅ 已提交认证！3张高危发票全部认证成功。\n\n📄 认证结果：\n• 苏宁电气 ✅ 成功\n• 雪峰致远 ✅ 成功\n• 华中·第1分公司 ✅ 成功\n\n💰 预计可抵扣：¥469,500',
            'actions': [
                {'label': '查看认证记录', 'intent': 'show_cert_history'},
                {'label': '继续处理其他', 'intent': 'back_to_tasks'},
            ]
        }
    
    if '华中' in msg or 'region' in msg or '区域' in msg:
        return {
            'type': 'analysis',
            'text': '📊 华中区认证率45%，低于集团均值26个百分点。\n\n🔍 主要原因：\n• 华中·第1分公司 — 23张超期未认证\n• 华中·第3分公司 — 8张超期\n\n💰 如果全部补认证，可追回 **¥56万**。',
            'cards': [
                {
                    'type': 'data-card',
                    'title': '华中区认证趋势',
                    'summary': '45% · 低于均值71.2% · 较上月-12%',
                    'chart': 'bar',
                    'dimensions': ['第1分公司', '第3分公司', '第5分公司', '第7分公司'],
                    'values': [23, 8, 3, 2],
                    'status': 'danger',
                }
            ],
            'actions': [
                {'label': '📨 发督办到华中区', 'intent': 'send_urge', 'params': {'region': '华中区'}},
                {'label': '📊 看完整分析', 'intent': 'show_full_analysis'},
            ]
        }
    
    if '风险' in msg or 'risk' in msg or '高危' in msg:
        return {
            'type': 'alert',
            'text': '⚠️ 高风险公司详情：\n\n**华中·第1分公司** — 风险分 92\n🔴 开票量环比+340%（23→101张）\n🔴 60张发票金额集中在¥9,900-¥9,999\n🔴 凌晨0-5点开票12张\n\n潜在后果：虚开发票认定，补税+罚款约¥80万',
            'actions': [
                {'label': '生成审计底稿', 'intent': 'gen_audit_paper'},
                {'label': '查看明细', 'intent': 'view_risk_detail'},
                {'label': '标记已处理', 'intent': 'mark_handled'},
            ]
        }
    
    if '申报' in msg or 'declare' in msg or '进度' in msg:
        return {
            'type': 'data',
            'text': '📋 当前申报进度：\n\n✅ 增值税 — 577/600（96.2%）\n🟠 所得税 — 312/600（52.0%）— 截止18日\n✅ 附加税 — 520/600（86.7%）\n\n未申报主要集中在华中区（12家）和华南区（8家）。',
            'actions': [
                {'label': '📨 催办未申报', 'intent': 'urge_unfiled'},
                {'label': '📊 查看区域分布', 'intent': 'show_region_distribution'},
            ]
        }
    
    if '帮助' in msg or 'help' in msg or '能做什么' in msg:
        return {
            'type': 'text',
            'text': '你可以问我这些问题：\n\n📄 **发票认证** — "查一下认证进度" "认证这3张发票"\n📋 **申报管理** — "还有多少没申报" "催一下未申报的"\n⚠️ **风险监控** — "有什么风险" "查一下华中第1分公司"\n💰 **税负分析** — "税负率多少" "为什么高了"\n📊 **数据查询** — "认证率趋势" "按区域分析"\n\n需要试试哪个？',
            'actions': [
                {'label': '查认证进度', 'intent': 'show_cert_trend'},
                {'label': '查风险公司', 'intent': 'show_high_risk'},
                {'label': '看申报进度', 'intent': 'show_decl_detail'},
            ]
        }
    
    # 默认回复
    return {
        'type': 'text',
        'text': f'收到你的消息了。我正在分析...\n\n你说的是："{message}"\n\n我还在学习中，暂时还不能完全理解这个问题。你可以试试：\n• "查一下认证率"\n• "华中区为什么这么低"\n• "帮我认证发票"\n• "有什么风险"\n\n或者需要我找其他智能体帮你吗？',
        'actions': [
            {'label': '查看帮助', 'intent': 'help'},
            {'label': '换一个智能体', 'intent': 'switch_agent_suggest'},
        ]
    }

if __name__ == '__main__':
    print("🚀 AI CFO Next (AI原生交互版) 启动中...")
    print("🌐 http://localhost:5003")
    app.run(host='0.0.0.0', port=5003, debug=True)
