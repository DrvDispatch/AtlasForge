import { IsString, IsOptional, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateOfferingDto {
    @IsString()
    @MaxLength(200)
    name: string;

    @IsString()
    @MaxLength(100)
    slug: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    priceCents?: number;

    @IsOptional()
    @IsString()
    priceDisplay?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    durationText?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class UpdateOfferingDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    name?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    description?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    priceCents?: number;

    @IsOptional()
    @IsString()
    priceDisplay?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    durationMinutes?: number;

    @IsOptional()
    @IsString()
    durationText?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}

export class CreateOfferingCategoryDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @MaxLength(100)
    slug: string;

    @IsOptional()
    @IsString()
    parentId?: string;

    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;

    @IsOptional()
    @IsString()
    icon?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    sortOrder?: number;
}
