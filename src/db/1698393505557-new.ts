// import { MigrationInterface, QueryRunner } from "typeorm";

// export class New1698393505557 implements MigrationInterface {
//     name = 'New1698393505557'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ALTER COLUMN "isApproved" SET DEFAULT false`);
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query(`ALTER TABLE "children_pre_register_entity" ALTER COLUMN "isApproved" DROP DEFAULT`);
//     }

// }