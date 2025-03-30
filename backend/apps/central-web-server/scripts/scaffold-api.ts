import { mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { camelCase } from 'lodash';
import { resolve } from 'path';

/**
 *
 * @param apiName name of api in kebab case, singular form
 */
const generateServiceFile = (apiName: string) => {
  const camelCased = camelCase(apiName);
  const pascalCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);

  const lines: string[] = [];
  lines.push(`import { Injectable } from '@nestjs/common';`);
  lines.push(`import { InjectModel } from '@nestjs/mongoose';`);
  lines.push(`import { Model } from 'mongoose';`);
  lines.push(
    `import { ${pascalCased}, ${pascalCased}Document } from './schemas/${apiName}.schema';`,
  );
  lines.push(``);
  lines.push(`@Injectable()`);
  lines.push(`export class ${pascalCased}Service {`);
  lines.push(
    `  constructor(@InjectModel(${pascalCased}.name) public ${camelCased}Model: Model<${pascalCased}>) {}`,
  );
  lines.push(`}`);
  return lines.join('\n');
};

const generateControllerFile = (apiName: string) => {
  const camelCased = camelCase(apiName);
  const pascalCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);

  const lines: string[] = [];
  lines.push(
    `import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';`,
  );
  lines.push(`import { ${pascalCased}Service } from './${apiName}.service';`);
  lines.push(
    `import { QsQuery } from 'src/common/decorators/qs-query.decorator';`,
  );
  lines.push(
    `import { QsQueryObject } from 'src/common/class-validators/qs-query.dto';`,
  );
  lines.push(
    `import { Update${pascalCased}Dto } from './dtos/update-${apiName}.dto';`,
  );
  lines.push(
    `import { Create${pascalCased}Dto } from './dtos/create-${apiName}.dto';`,
  );
  lines.push(``);
  lines.push(`@Controller('${apiName + 's'}')`);
  lines.push(`export class ${pascalCased}Controller {`);
  lines.push(
    `  constructor(private readonly ${camelCased}Service: ${pascalCased}Service) {}`,
  );
  lines.push(``);
  lines.push(`  @Post()`);
  lines.push(`  async createOne(@Body() data: Create${pascalCased}Dto) {}`);
  lines.push(``);
  lines.push(`  @Get()`);
  lines.push(`  async getList(@QsQuery() query: QsQueryObject) {}`);
  lines.push(``);
  lines.push(`  @Get('get-many')`);
  lines.push(`  async getMany(@QsQuery() query: QsQueryObject) {}`);
  lines.push(``);
  lines.push(`  @Get(':id')`);
  lines.push(
    `  async getOne(@Param('id') id: string, @QsQuery() query: QsQueryObject) {}`,
  );
  lines.push(``);
  lines.push(`  @Put('update-many')`);
  lines.push(
    `  async updateMany(@QsQuery() query: QsQueryObject, @Body() body: Update${pascalCased}Dto) {}`,
  );
  lines.push(``);
  lines.push(`  @Put(':id')`);
  lines.push(
    `  async updateOne(@Param('id') id: string, @Body() body: Update${pascalCased}Dto, @QsQuery() query: QsQueryObject) {}`,
  );
  lines.push(``);
  lines.push(`  @Delete('delete-many')`);
  lines.push(`  async deleteMany(@QsQuery() query: QsQueryObject) {}`);
  lines.push(``);
  lines.push(`  @Delete(':id')`);
  lines.push(`  async deleteOne(@Param('id') id: string) {}`);
  lines.push(``);
  lines.push(`}`);
  return lines.join('\n');
};

const generateCreateRecordDtoFile = (apiName: string) => {
  const camelCased = camelCase(apiName);
  const pascalCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
  const lines: string[] = [];
  lines.push(`import { IsNotEmpty, IsString } from 'class-validator';`);
  lines.push(``);
  lines.push(`export class Create${pascalCased}Dto {`);
  lines.push(`}`);
  return lines.join('\n');
};

const generateUpdateRecordDtoFile = (apiName: string) => {
  const camelCased = camelCase(apiName);
  const pascalCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
  const lines: string[] = [];
  lines.push(`import { PartialType } from '@nestjs/mapped-types';`);
  lines.push(
    `import { Create${pascalCased}Dto } from './create-${apiName}.dto';`,
  );
  lines.push(``);
  lines.push(
    `export class Update${pascalCased}Dto extends PartialType(Create${pascalCased}Dto) {`,
  );
  lines.push(`}`);
  return lines.join('\n');
};

const generateModuleFile = (apiName: string) => {
  const camelCased = camelCase(apiName);
  const pascalCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
  const lines: string[] = [];
  lines.push(`import { Module } from '@nestjs/common';`);
  lines.push(`import { MongooseModule } from '@nestjs/mongoose';`);
  lines.push(`import { ${pascalCased}Service } from './${apiName}.service';`);
  lines.push(
    `import { ${pascalCased}Controller } from './${apiName}.controller';`,
  );
  lines.push(
    `import { ${pascalCased}, ${pascalCased}Schema } from './schemas/${apiName}.schema';`,
  );
  lines.push(``);
  lines.push(`@Module({`);
  lines.push(
    `  imports: [MongooseModule.forFeature([{ name: ${pascalCased}.name, schema: ${pascalCased}Schema }])],`,
  );
  lines.push(`  controllers: [${pascalCased}Controller],`);
  lines.push(`  providers: [${pascalCased}Service],`);
  lines.push(`  exports: [${pascalCased}Service],`);
  lines.push(`})`);
  lines.push(`export class ${pascalCased}Module {}`);
  return lines.join('\n');
};

const generateSchemaFile = (apiName: string) => {
  const camelCased = camelCase(apiName);
  const pascalCased = camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
  const lines: string[] = [];
  lines.push(`import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';`);
  lines.push(`import { Document } from 'mongoose';`);
  lines.push(``);
  lines.push(`@Schema()`);
  lines.push(`export class ${pascalCased} {`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`export type ${pascalCased}Document = ${pascalCased} & Document;`);
  lines.push(``);
  lines.push(
    `export const ${pascalCased}Schema = SchemaFactory.createForClass(${pascalCased});`,
  );
  return lines.join('\n');
};

const scaffoldApi = async (apiName: string) => {
  const apiDir = resolve(__dirname, '../src', 'api', apiName);
  const dtosDir = resolve(apiDir, 'dtos');
  const schemasDir = resolve(apiDir, 'schemas');
  mkdirSync(dtosDir, { recursive: true });
  mkdirSync(schemasDir, { recursive: true });

  await Promise.all([
    writeFile(`${apiDir}/${apiName}.service.ts`, generateServiceFile(apiName)),
    writeFile(
      `${apiDir}/${apiName}.controller.ts`,
      generateControllerFile(apiName),
    ),
    writeFile(
      `${dtosDir}/create-${apiName}.dto.ts`,
      generateCreateRecordDtoFile(apiName),
    ),
    writeFile(
      `${dtosDir}/update-${apiName}.dto.ts`,
      generateUpdateRecordDtoFile(apiName),
    ),
    writeFile(`${apiDir}/${apiName}.module.ts`, generateModuleFile(apiName)),
    writeFile(
      `${schemasDir}/${apiName}.schema.ts`,
      generateSchemaFile(apiName),
    ),
  ]);
};

// if this script is run directly, scaffold the api for the given name extracted from the command line arguments
if (require.main === module) {
  void scaffoldApi(process.argv[2]);
}
