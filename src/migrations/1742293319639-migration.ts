import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1742293319639 implements MigrationInterface {
    name = 'Migration1742293319639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invitation" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "companyId" integer, "userId" integer, CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "request" ("id" SERIAL NOT NULL, "status" character varying NOT NULL, "companyId" integer, "userId" integer, CONSTRAINT "PK_167d324701e6867f189aed52e18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "membership" ("id" SERIAL NOT NULL, "role" character varying NOT NULL, "companyId" integer, "userId" integer, CONSTRAINT "PK_83c1afebef3059472e7c37e8de8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD CONSTRAINT "FK_757968494b8501e4e3b27860fb0" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD CONSTRAINT "FK_05191060fae5b5485327709be7f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request" ADD CONSTRAINT "FK_a3f4e1de561216f322b16127fe9" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request" ADD CONSTRAINT "FK_38554ade327a061ba620eee948b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership" ADD CONSTRAINT "FK_a3548976d3416dcaeac8b69ce03" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "membership" ADD CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "membership" DROP CONSTRAINT "FK_eef2d9d9c70cd13bed868afedf4"`);
        await queryRunner.query(`ALTER TABLE "membership" DROP CONSTRAINT "FK_a3548976d3416dcaeac8b69ce03"`);
        await queryRunner.query(`ALTER TABLE "request" DROP CONSTRAINT "FK_38554ade327a061ba620eee948b"`);
        await queryRunner.query(`ALTER TABLE "request" DROP CONSTRAINT "FK_a3f4e1de561216f322b16127fe9"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "FK_05191060fae5b5485327709be7f"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "FK_757968494b8501e4e3b27860fb0"`);
        await queryRunner.query(`DROP TABLE "membership"`);
        await queryRunner.query(`DROP TABLE "request"`);
        await queryRunner.query(`DROP TABLE "invitation"`);
    }

}
