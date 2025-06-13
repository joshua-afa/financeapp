import{createClient as f}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function r(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(o){if(o.ep)return;o.ep=!0;const a=r(o);fetch(o.href,a)}})();const h="https://ktwaucthhqmqwimyavdm.supabase.co",p="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0d2F1Y3RoaHFtcXdpbXlhdmRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3ODkxNDcsImV4cCI6MjA2NTM2NTE0N30.hyqKpajD4sjUb_KPAbLW3P1NrdWcV3D-rRmYAvtroNo",s=f(h,p),m={async getAccounts(){const{data:t,error:e}=await s.from("accounts").select("*").eq("is_active",!0).order("name");if(e)throw console.error("Error fetching accounts:",e),e;return t},async addAccount(t){const{data:e,error:r}=await s.from("accounts").insert([{name:t.name,type:t.type,bank_name:t.bank_name||null,account_number:t.account_number||null,balance:t.balance||0,is_active:!0}]).select();if(r)throw console.error("Error adding account:",r),r;return e[0]},async updateAccountBalance(t,e){const{data:r,error:n}=await s.from("accounts").update({balance:e}).eq("id",t).select();if(n)throw console.error("Error updating account balance:",n),n;return r[0]},async getCategories(t=null){let e=s.from("categories").select("*").order("name");t&&(e=e.eq("type",t));const{data:r,error:n}=await e;if(n)throw console.error("Error fetching categories:",n),n;return r},async addCategory(t){const{data:e,error:r}=await s.from("categories").insert([{name:t.name,type:t.type}]).select();if(r)throw console.error("Error adding category:",r),r;return e[0]},async getSubcategories(t=null){let e=s.from("subcategories").select("*").order("name");t&&(e=e.eq("category_id",t));const{data:r,error:n}=await e;if(n)throw console.error("Error fetching subcategories:",n),n;return r},async addSubcategory(t){const{data:e,error:r}=await s.from("subcategories").insert([{category_id:t.category_id,name:t.name}]).select();if(r)throw console.error("Error adding subcategory:",r),r;return e[0]},async getTransactions(t={}){let e=s.from("transactions").select(`
        *,
        accounts (name, type),
        categories (name, type),
        subcategories (name)
      `).order("date",{ascending:!1});t.account_id&&(e=e.eq("account_id",t.account_id)),t.type&&(e=e.eq("type",t.type)),t.category_id&&(e=e.eq("category_id",t.category_id)),t.date_from&&(e=e.gte("date",t.date_from)),t.date_to&&(e=e.lte("date",t.date_to)),t.limit&&(e=e.limit(t.limit));const{data:r,error:n}=await e;if(n)throw console.error("Error fetching transactions:",n),n;return r},async addTransaction(t){const{data:e,error:r}=await s.from("transactions").insert([{account_id:t.account_id,type:t.type,category_id:t.category_id,subcategory_id:t.subcategory_id||null,amount:t.amount,description:t.description||null,date:t.date}]).select();if(r)throw console.error("Error adding transaction:",r),r;return e[0]},async deleteTransaction(t){const{error:e}=await s.from("transactions").delete().eq("id",t);if(e)throw console.error("Error deleting transaction:",e),e;return!0},async getMonthlyTotals(t,e){const r=`${t}-${e.toString().padStart(2,"0")}-01`,n=new Date(t,e,0).toISOString().split("T")[0],{data:o,error:a}=await s.from("transactions").select("type, amount").gte("date",r).lte("date",n);if(a)throw console.error("Error fetching monthly totals:",a),a;return o.reduce((u,i)=>(i.type==="income"?u.income+=parseFloat(i.amount):u.expense+=parseFloat(i.amount),u),{income:0,expense:0})},async getCategoryBreakdown(t,e,r="expense"){const n=`${t}-${e.toString().padStart(2,"0")}-01`,o=new Date(t,e,0).toISOString().split("T")[0],{data:a,error:c}=await s.from("transactions").select(`
        amount,
        categories (name)
      `).eq("type",r).gte("date",n).lte("date",o);if(c)throw console.error("Error fetching category breakdown:",c),c;const u=a.reduce((i,l)=>{var g;const y=((g=l.categories)==null?void 0:g.name)||"Uncategorized";return i[y]=(i[y]||0)+parseFloat(l.amount),i},{});return Object.entries(u).map(([i,l])=>({name:i,amount:l})).sort((i,l)=>l.amount-i.amount)},async getTotalBalance(){const{data:t,error:e}=await s.from("accounts").select("balance").eq("is_active",!0);if(e)throw console.error("Error fetching total balance:",e),e;return t.reduce((r,n)=>r+parseFloat(n.balance||0),0)}},d={formatCurrency(t){return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:2}).format(t)},formatDate(t){return new Date(t).toLocaleDateString("en-IN",{year:"numeric",month:"short",day:"numeric"})},getCurrentDate(){return new Date().toISOString().split("T")[0]},getCurrentMonth(){const t=new Date;return{year:t.getFullYear(),month:t.getMonth()+1}},showLoading(){const t=document.getElementById("loadingSpinner");t&&(t.style.display="flex")},hideLoading(){const t=document.getElementById("loadingSpinner");t&&(t.style.display="none")},showNotification(t,e="success"){const r=document.getElementById("notification");r&&(r.textContent=t,r.className=`notification ${e}`,r.classList.add("show"),setTimeout(()=>{r.classList.remove("show")},3e3))},exportToCSV(t,e){const r=this.convertToCSV(t),n=new Blob([r],{type:"text/csv;charset=utf-8;"}),o=document.createElement("a");if(o.download!==void 0){const a=URL.createObjectURL(n);o.setAttribute("href",a),o.setAttribute("download",e),o.style.visibility="hidden",document.body.appendChild(o),o.click(),document.body.removeChild(o)}},convertToCSV(t){if(!t||t.length===0)return"";const e=Object.keys(t[0]),r=[];r.push(e.join(","));for(const n of t){const o=e.map(a=>{const c=n[a];return typeof c=="string"?`"${c.replace(/"/g,'""')}"`:c});r.push(o.join(","))}return r.join(`
`)}};class b{constructor(){this.init()}async init(){try{d.showLoading(),await this.loadDashboardData()}catch(e){console.error("Error initializing dashboard:",e),d.showNotification("Error loading dashboard data. Please check your Supabase configuration.","error")}finally{d.hideLoading()}}async loadDashboardData(){const e=d.getCurrentMonth(),[r,n,o,a,c]=await Promise.all([m.getAccounts(),m.getMonthlyTotals(e.year,e.month),m.getTransactions({limit:5}),m.getCategoryBreakdown(e.year,e.month),m.getTotalBalance()]);this.renderTotalBalance(c),this.renderMonthlyStats(n),this.renderAccounts(r),this.renderRecentTransactions(o),this.renderCategoryBreakdown(a)}renderTotalBalance(e){const r=document.getElementById("totalBalance");r&&(r.textContent=d.formatCurrency(e))}renderMonthlyStats(e){const r=document.getElementById("monthlyIncome"),n=document.getElementById("monthlyExpenses");r&&(r.textContent=d.formatCurrency(e.income)),n&&(n.textContent=d.formatCurrency(e.expense))}renderAccounts(e){const r=document.getElementById("accountsGrid");if(r){if(e.length===0){r.innerHTML=`
        <div class="empty-state">
          <p>No accounts found. <a href="categories.html">Add your first account</a> to get started.</p>
        </div>
      `;return}r.innerHTML=e.map(n=>`
      <div class="account-card">
        <div class="account-header">
          <div class="account-name">${n.name}</div>
          <div class="account-type">${n.type}</div>
        </div>
        <div class="account-balance">${d.formatCurrency(n.balance||0)}</div>
        ${n.bank_name?`<div class="account-bank">${n.bank_name}</div>`:""}
      </div>
    `).join("")}}renderRecentTransactions(e){const r=document.getElementById("recentTransactionsBody");if(r){if(e.length===0){r.innerHTML=`
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            No transactions found. <a href="add.html">Add your first transaction</a> to get started.
          </td>
        </tr>
      `;return}r.innerHTML=e.map(n=>{var o,a,c;return`
      <tr>
        <td>${d.formatDate(n.date)}</td>
        <td>${n.description||"-"}</td>
        <td>
          ${((o=n.categories)==null?void 0:o.name)||"Uncategorized"}
          ${(a=n.subcategories)!=null&&a.name?`<br><small style="color: var(--text-secondary);">${n.subcategories.name}</small>`:""}
        </td>
        <td>${((c=n.accounts)==null?void 0:c.name)||"Unknown"}</td>
        <td class="${n.type==="income"?"amount-positive":"amount-negative"}">
          ${n.type==="income"?"+":"-"}${d.formatCurrency(n.amount)}
        </td>
      </tr>
    `}).join("")}}renderCategoryBreakdown(e){const r=document.getElementById("categoryBreakdown");if(!r)return;if(e.length===0){r.innerHTML=`
        <div class="empty-state">
          <p>No expense data for this month.</p>
        </div>
      `;return}const n=["#ef4444","#f97316","#f59e0b","#eab308","#84cc16","#22c55e","#10b981","#14b8a6","#06b6d4","#0ea5e9","#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899"];r.innerHTML=e.slice(0,8).map((o,a)=>`
      <div class="category-breakdown-item">
        <div class="category-info">
          <div class="category-color" style="background-color: ${n[a%n.length]}"></div>
          <div class="category-breakdown-name">${o.name}</div>
        </div>
        <div class="category-breakdown-amount">${d.formatCurrency(o.amount)}</div>
      </div>
    `).join("")}}document.addEventListener("DOMContentLoaded",()=>{new b});document.addEventListener("DOMContentLoaded",function(){const t=document.querySelector(".hamburger"),e=document.querySelector(".nav-menu");t&&e&&(t.addEventListener("click",()=>{t.classList.toggle("active"),e.classList.toggle("active")}),document.querySelectorAll(".nav-link").forEach(r=>{r.addEventListener("click",()=>{t.classList.remove("active"),e.classList.remove("active")})}),document.addEventListener("click",r=>{!t.contains(r.target)&&!e.contains(r.target)&&(t.classList.remove("active"),e.classList.remove("active"))}))});
