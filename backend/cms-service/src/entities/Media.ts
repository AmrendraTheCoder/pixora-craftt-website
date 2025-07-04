import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio'
}

@Entity('media')
@Index(['type'])
@Index(['isActive'])
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ type: 'bigint' })
  fileSize!: number;

  @Column({ type: 'varchar', length: 500 })
  filePath!: string;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({
    type: 'enum',
    enum: MediaType,
    default: MediaType.IMAGE
  })
  type!: MediaType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText?: string;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ type: 'integer', nullable: true })
  width?: number;

  @Column({ type: 'integer', nullable: true })
  height?: number;

  @Column({ type: 'json', nullable: true })
  thumbnails?: Record<string, string>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Methods
  toPublicObject() {
    return {
      id: this.id,
      fileName: this.fileName,
      originalName: this.originalName,
      mimeType: this.mimeType,
      fileSize: this.fileSize,
      url: this.url,
      type: this.type,
      altText: this.altText,
      caption: this.caption,
      width: this.width,
      height: this.height,
      thumbnails: this.thumbnails || {},
      metadata: this.metadata || {},
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  get isImage(): boolean {
    return this.type === MediaType.IMAGE;
  }

  get isVideo(): boolean {
    return this.type === MediaType.VIDEO;
  }

  get fileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  get fileSizeFormatted(): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.fileSize === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.fileSize) / Math.log(1024));
    return Math.round(this.fileSize / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
} 