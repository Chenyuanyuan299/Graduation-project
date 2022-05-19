import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { User } from './user'
import { Comment } from './comment'
import { Tag } from './tag'

@Entity({name: 'articles'})
export class Article extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  title!: string;

  @Column()
  content!: string;

  @Column()
  views!: number;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @Column()
  is_delete!: boolean;

  @Column()
  like_counts!: number;

  @Column()
  is_draft!: boolean;

  @Column()
  rel_id!: number;

  @ManyToMany(() => User, {
    cascade: true
  })
  @JoinTable({
    name: 'articles_likes_rel',
    joinColumn: {
      name: 'article_id'
    },
    inverseJoinColumn: {
      name: 'user_id'
    }
  })
  like_users!: User[]

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToMany(() => Tag, (tag) => tag.articles, {
    cascade: true
  })
  tags!: Tag[]

  @OneToMany(() => Comment, (comment) => comment.article)
  comments!: Comment[]
}