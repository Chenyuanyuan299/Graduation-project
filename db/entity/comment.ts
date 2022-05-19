import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { User } from './user'
import { Article } from './article'
import { RelatedComment } from './related_comment';
@Entity({name: 'comments'})
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  content!: string;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @Column()
  rank!: number;

  @Column()
  is_delete!: boolean;

  @Column()
  like_counts!: number;

  @ManyToMany(() => User, {
    cascade: true
  })
  @JoinTable({
    name: 'comments_likes_rel',
    joinColumn: {
      name: 'comment_id'
    },
    inverseJoinColumn: {
      name: 'user_id'
    }
  })
  like_users!: User[]

  @OneToMany(() => RelatedComment, (related_comment) => related_comment.rel_comment)
  related_comments!: RelatedComment[]

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToOne(() => Article)
  @JoinColumn({name: 'article_id'})
  article!: Article;
}