CREATE DATABASE IF NOT EXISTS sms;
USE sms;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  city VARCHAR(80) NULL,
  state VARCHAR(80) NULL,
  address TEXT NULL,
  phone VARCHAR(30) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS designations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL UNIQUE,
  level VARCHAR(80) NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(80) NULL,
  description TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employees (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_code VARCHAR(50) NULL UNIQUE,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  gender ENUM('male', 'female', 'other') NULL,
  date_of_birth DATE NULL,
  hire_date DATE NULL,
  employment_type ENUM('full_time', 'part_time', 'contract', 'intern') NOT NULL DEFAULT 'full_time',
  status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active',
  salary DECIMAL(12,2) NULL,
  branch_id INT UNSIGNED NOT NULL,
  designation_id INT UNSIGNED NOT NULL,
  address TEXT NULL,
  emergency_contact_name VARCHAR(120) NULL,
  emergency_contact_phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_employees_designation FOREIGN KEY (designation_id) REFERENCES designations(id)
);

CREATE TABLE IF NOT EXISTS employee_skills (
  employee_id INT UNSIGNED NOT NULL,
  skill_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (employee_id, skill_id),
  CONSTRAINT fk_employee_skills_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_employee_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id)
);

CREATE TABLE IF NOT EXISTS shifts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  branch_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT UNSIGNED NOT NULL,
  break_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  color_code CHAR(7) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_shifts_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  UNIQUE KEY uk_shifts_branch_name (branch_id, name)
);

CREATE TABLE IF NOT EXISTS employee_shifts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  shift_id INT UNSIGNED NOT NULL,
  shift_date DATE NOT NULL,
  status ENUM('scheduled', 'off', 'leave') NOT NULL DEFAULT 'scheduled',
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee_shifts_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_employee_shifts_shift FOREIGN KEY (shift_id) REFERENCES shifts(id),
  UNIQUE KEY uk_employee_shift_date (employee_id, shift_date)
);

CREATE TABLE IF NOT EXISTS employee_leaves (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  employee_id INT UNSIGNED NOT NULL,
  leave_type ENUM('casual', 'sick', 'earned', 'unpaid', 'maternity', 'paternity', 'other') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT UNSIGNED NOT NULL,
  reason TEXT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  approved_by INT UNSIGNED NULL,
  approved_at DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_employee_leaves_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_employee_leaves_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
  INDEX idx_employee_leaves_employee_date (employee_id, start_date, end_date),
  INDEX idx_employee_leaves_status (status)
);

CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(191) NULL UNIQUE,
  gender ENUM('male', 'female', 'other') NULL,
  date_of_birth DATE NULL,
  address TEXT NULL,
  notes TEXT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  branch_id INT UNSIGNED NOT NULL,
  employee_id INT UNSIGNED NOT NULL,
  service_name VARCHAR(150) NOT NULL,
  service_notes TEXT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT UNSIGNED NOT NULL,
  status ENUM('scheduled', 'confirmed', 'checked_in', 'in_service', 'completed', 'cancelled', 'no_show', 'rescheduled') NOT NULL DEFAULT 'scheduled',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_appointments_branch FOREIGN KEY (branch_id) REFERENCES branches(id),
  CONSTRAINT fk_appointments_employee FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_appointments_branch_date (branch_id, appointment_date),
  INDEX idx_appointments_employee_date_time (employee_id, appointment_date, start_time),
  INDEX idx_appointments_customer_date (customer_id, appointment_date)
);
