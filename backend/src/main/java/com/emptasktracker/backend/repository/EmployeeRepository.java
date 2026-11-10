package com.emptasktracker.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.emptasktracker.backend.entity.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

}