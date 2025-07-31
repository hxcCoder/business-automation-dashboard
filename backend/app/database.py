import sqlite3
import json
from datetime import datetime, timedelta
from typing import List, Optional
from .models import Workflow, Execution, DashboardStats, ChartData
import random

class Database:
    def __init__(self, db_path: str = "business_automation.db"):
        self.db_path = db_path
        self.init_database()
        self.seed_sample_data()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Inicializar tablas de la base de datos"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Tabla de workflows
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS workflows (
                id TEXT PRIMARY KEY,
                n8n_id TEXT,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT DEFAULT 'General',
                status TEXT DEFAULT 'inactive',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_execution TIMESTAMP,
                total_executions INTEGER DEFAULT 0,
                success_rate REAL DEFAULT 0.0,
                avg_execution_time REAL DEFAULT 0.0,
                time_saved_hours REAL DEFAULT 0.0,
                triggers TEXT DEFAULT '[]',
                actions TEXT DEFAULT '[]'
            )
        ''')
        
        # Tabla de ejecuciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS executions (
                id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                workflow_name TEXT NOT NULL,
                n8n_execution_id TEXT,
                status TEXT NOT NULL,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                duration REAL,
                triggered_by TEXT DEFAULT 'manual',
                data_processed INTEGER DEFAULT 0,
                error_message TEXT,
                FOREIGN KEY (workflow_id) REFERENCES workflows (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def seed_sample_data(self):
        """Poblar con datos de ejemplo si la DB está vacía"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Verificar si ya hay datos
        cursor.execute("SELECT COUNT(*) FROM workflows")
        if cursor.fetchone()[0] > 0:
            conn.close()
            return
        
        # Datos de ejemplo
        sample_workflows = [
            {
                'id': 'wf-001',
                'n8n_id': '1',
                'name': 'E-commerce Order Processing',
                'description': 'Automatiza el procesamiento de pedidos desde Shopify hasta el sistema de inventario',
                'category': 'E-commerce',
                'status': 'active',
                'total_executions': 1247,
                'success_rate': 98.5,
                'avg_execution_time': 2340,
                'time_saved_hours': 156.2,
                'triggers': '["Shopify Webhook", "Schedule"]',
                'actions': '["Update Inventory", "Send Email", "Create Invoice"]'
            },
            {
                'id': 'wf-002',
                'n8n_id': '2',
                'name': 'Lead Qualification System',
                'description': 'Califica leads automáticamente y los asigna al equipo de ventas apropiado',
                'category': 'Sales',
                'status': 'active',
                'total_executions': 892,
                'success_rate': 96.8,
                'avg_execution_time': 1890,
                'time_saved_hours': 89.3,
                'triggers': '["Form Submission", "CRM Update"]',
                'actions': '["Score Lead", "Assign Sales Rep", "Send Notification"]'
            },
            {
                'id': 'wf-003',
                'n8n_id': '3',
                'name': 'Social Media Content Sync',
                'description': 'Sincroniza contenido entre múltiples plataformas sociales',
                'category': 'Marketing',
                'status': 'error',
                'total_executions': 445,
                'success_rate': 94.2,
                'avg_execution_time': 3200,
                'time_saved_hours': 67.8,
                'triggers': '["Content Published", "Schedule"]',
                'actions': '["Post to Twitter", "Post to LinkedIn", "Update Analytics"]'
            }
        ]
        
        for workflow in sample_workflows:
            cursor.execute('''
                INSERT INTO workflows (id, n8n_id, name, description, category, status, 
                                     total_executions, success_rate, avg_execution_time, 
                                     time_saved_hours, triggers, actions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                workflow['id'], workflow['n8n_id'], workflow['name'], 
                workflow['description'], workflow['category'], workflow['status'],
                workflow['total_executions'], workflow['success_rate'], 
                workflow['avg_execution_time'], workflow['time_saved_hours'],
                workflow['triggers'], workflow['actions']
            ))
        
        # Generar ejecuciones de ejemplo
        execution_data = []
        for i in range(50):
            workflow_id = random.choice(['wf-001', 'wf-002', 'wf-003'])
            workflow_name = {
                'wf-001': 'E-commerce Order Processing',
                'wf-002': 'Lead Qualification System', 
                'wf-003': 'Social Media Content Sync'
            }[workflow_id]
            
            status = random.choices(['success', 'error'], weights=[95, 5])[0]
            start_time = datetime.now() - timedelta(days=random.randint(0, 30))
            duration = random.randint(1000, 5000) if status == 'success' else random.randint(5000, 10000)
            
            execution_data.append((
                f'exec-{i+1:03d}',
                workflow_id,
                workflow_name,
                f'n8n-exec-{i+1}',
                status,
                start_time.isoformat(),
                (start_time + timedelta(milliseconds=duration)).isoformat(),
                duration,
                random.choice(['Webhook', 'Schedule', 'Manual']),
                random.randint(1, 20),
                'API rate limit exceeded' if status == 'error' else None
            ))
        
        cursor.executemany('''
            INSERT INTO executions (id, workflow_id, workflow_name, n8n_execution_id,
                                  status, start_time, end_time, duration, triggered_by,
                                  data_processed, error_message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', execution_data)
        
        conn.commit()
        conn.close()
    
    def get_workflows(self) -> List[Workflow]:
        """Obtener todos los workflows"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM workflows ORDER BY total_executions DESC
        ''')
        
        workflows = []
        for row in cursor.fetchall():
            workflow_dict = dict(row)
            workflow_dict['triggers'] = json.loads(workflow_dict['triggers'])
            workflow_dict['actions'] = json.loads(workflow_dict['actions'])
            workflows.append(Workflow(**workflow_dict))
        
        conn.close()
        return workflows
    
    def get_executions(self, workflow_id: Optional[str] = None, limit: int = 50) -> List[Execution]:
        """Obtener ejecuciones"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if workflow_id:
            cursor.execute('''
                SELECT * FROM executions 
                WHERE workflow_id = ? 
                ORDER BY start_time DESC 
                LIMIT ?
            ''', (workflow_id, limit))
        else:
            cursor.execute('''
                SELECT * FROM executions 
                ORDER BY start_time DESC 
                LIMIT ?
            ''', (limit,))
        
        executions = []
        for row in cursor.fetchall():
            executions.append(Execution(**dict(row)))
        
        conn.close()
        return executions
    
    def get_dashboard_stats(self) -> DashboardStats:
        """Calcular estadísticas del dashboard"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Estadísticas de workflows
        cursor.execute('SELECT COUNT(*) FROM workflows')
        total_workflows = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM workflows WHERE status = 'active'")
        active_workflows = cursor.fetchone()[0]
        
        # Estadísticas de ejecuciones
        cursor.execute('SELECT COUNT(*) FROM executions')
        total_executions = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM executions WHERE status = 'success'")
        successful_executions = cursor.fetchone()[0]
        
        success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0
        
        # Estadísticas de hoy
        today = datetime.now().date()
        cursor.execute('''
            SELECT COUNT(*) FROM executions 
            WHERE DATE(start_time) = ?
        ''', (today,))
        executions_today = cursor.fetchone()[0]
        
        cursor.execute('''
            SELECT COUNT(*) FROM executions 
            WHERE DATE(start_time) = ? AND status = 'error'
        ''', (today,))
        errors_today = cursor.fetchone()[0]
        
        # Tiempo ahorrado y ROI
        cursor.execute('SELECT SUM(time_saved_hours) FROM workflows')
        total_time_saved = cursor.fetchone()[0] or 0
        
        total_roi = total_time_saved * 25  # $25/hora
        
        conn.close()
        
        return DashboardStats(
            total_workflows=total_workflows,
            active_workflows=active_workflows,
            total_executions=total_executions,
            success_rate=round(success_rate, 1),
            total_time_saved=total_time_saved,
            total_roi=total_roi,
            executions_today=executions_today,
            errors_today=errors_today
        )