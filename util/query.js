import pool from "./databaseConfig.js";
import { init } from "./menu.js";


function viewEmp(){
    pool.query(`SELECT
employees.id, employees.last_name, 
employees.first_name,  
role.title, 
department.name,
role.salary,
CONCAT (employees.first_name,' ',employees.last_name) 
AS employee_name, 
CONCAT(manager.first_name,' ',manager.last_name)AS manager_name
FROM department
JOIN role
ON department.id=role.department_id
JOIN employees
ON role.id=employees.role_id
LEFT JOIN employees manager 
ON employees.manager_id=manager.id;
`, (err, result) => {
    if (err){
        console.error(err);
    } else{
        console.log('\n');
        console.log('Viewing Slave Data ......');
        console.table(result.rows);
        init();
    }
})
};

function addEmp(){
    pool.query(`SELECT id,
    CONCAT ( employees.first_name,' ',employees.last_name) 
    AS manager_name FROM employees `,(err, res) => {
        if (err){
            console.error(err)
        }
        let manager = res.rows.map((row) => ({
            name: row.manager_name,
            value: row.id
        }));
        pool.query(`SELECT id, title FROM role`, (err, res) => {
            if (err){
                console.error(err)
            }
            let role = res.rows.map((row) =>({
                name: row.title,
                value: row.id
            }));

            const questions = [

                {
                    type: 'input',
                    name: 'firstName',
                    message:'WHAT IS THE FIRST NAME?'
                    
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message:'WHAT IS THE LAST NAME?'
                },
                {
                    type: 'list',
                    name: 'role',
                    message:'WHAT IS THE COMPANY SECTOR?',
                    choices:role,
                    
                },
                {
                    type: 'list',
                    name: 'manager',
                    message:`WHO IS THEIR CONTROLLER?`,
                    choices: manager
                },
            ];

            inquirer.prompt(questions).then((answers) =>{ 
                pool.query
                (`INSERT INTO employees
                (first_name, last_name, role_id, manager_id) 
                VALUES ($1, $2, $3, $4) RETURNING *`, 
                [answers.firstName, answers.lastName, answers.role, answers.manager])
                .then((res) => {
                    console.log('EMPLOYEE ADDED SUCCESSFULLY:', res.rows[0])
                    init();
                })
                .catch((err) => {
                    console.error('Error adding employee:', err)
                });  

            });
        });
    });
};

function viewRole(){

    pool.query
    (`SELECT role.id, 
    role.title, 
    department.name, 
    role.salary 
    FROM department LEFT 
    JOIN role ON department.id=department_id`, (err, result) =>{
        if(err){
            console.error(err);
        } else{
            console.log('VIEWING ROLES......')
            console.table(result.rows);
            init();
        };
    });

};

function updateRole(){
    pool.query(`SELECT id,
    CONCAT (employees.last_name,' ',employees.first_name) 
    AS employee_name FROM employees `,(err, res) => {
        if (err){
            console.error(err)
        }
        let employee = res.rows.map((row) => ({
            name: row.employee_name,
            value: row.id
        }));

        pool.query(`SELECT id, title FROM role`, (err, res) => {
            if (err){
                console.error(err)
            }
            let role = res.rows.map((row) =>({
                name: row.title,
                value: row.id
            }));

            const questions = [
                {
                    type:'list',
                    name: 'employee',
                    message:'SELECT EMPLOYEE',
                    choices: employee
                },
                {
                    type:'list',
                    name: 'newRole',
                    message:'SELECT THEIR NEW ROLE',
                    choices: role
                }
            ]
            inquirer.prompt(questions).then(answers => {
                pool.query(`UPDATE employees SET role_id = $1 WHERE id = $2`,
            [answers.newRole, answers.employee])
            .then((res) => {
                console.log('ROLES UPDATED')
                init();
            });
            });
        })
    });
};

function addRole(){
pool.query(`SELECT id, name FROM department`, 
(err, res) => {
    if (err){
        console.error(err)
    }
    let dep = res.rows.map((row) => ({
        name: row.name,
        value: row.id
    })

)
    
    const questions =[
        {
            type: 'input',
            name: 'role',
            message: 'Enter new role title.'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter wage cap.'
        },
        {
            type: 'list',
            name: 'department',
            message: 'What company sector does this belong to?',
            choices:dep
        }
    ]
    inquirer.prompt(questions).then((answers) =>{
        pool.query(`INSERT INTO role (title, salary, department_id) 
        VALUES ($1, $2, $3)`,
        [answers.role, answers.salary, answers.department]).then(
            console.log('UPDATING'),
            init()
        );
    })
})
};

function viewDep(){
    pool.query(`SELECT * FROM department`, (err, result) =>{
        if(err){
            console.error(err);
        } else{
            console.log('DEPARTMENT LIST.....')
            console.table(result.rows);
            init();
        }
    });
};

function addDep(){
const question = [
    {
        type:'input',
        name:'newDep',
        message:'WHATS THE NEW CORPORATE DEPARTMENT'
    }
]
inquirer.prompt(question).then((answers) => {
    pool.query(`INSERT INTO department(name)
        VALUES($1)`, [answers.newDep])
        init();
})
};

function quit(){
    console.log('EXITING.......')
}



export {
    viewEmp,
    addEmp,
    updateRole,
    viewRole,
    addRole,
    viewDep,
    addDep, 
    quit
};

















