const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Comment = require("../../src/db/models").Comment;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("Vote", () => {

    beforeEach((done) => {

        this.user;
        this.topic;
        this.post;
        this.vote;

        sequelize.sync({force: true}).then((res) => {
            User.create({
              email: "starman@tesla.com",
              password: "Trekkie4lyfe"
            })
            .then((res) => {
              this.user = res;
      
              Topic.create({
                title: "Expeditions to Alpha Centauri",
                description: "A compilation of reports from recent visits to the star system.",
                posts: [{
                  title: "My first visit to Proxima Centauri b",
                  body: "I saw some rocks.",
                  userId: this.user.id
                }]
              }, {
                include: {
                  model: Post,
                  as: "posts"
                }
              })
              .then((res) => {
                this.topic = res;
                this.post = this.topic.posts[0];
      
                Comment.create({
                    body: "ay caramba!!!!!",
                    userId: this.user.id,
                    postId: this.post.id
                })
                .then((res) => {
                    this.comment = res;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
              })
              .catch((err) => {
                    console.log(err);
                    done();
              });
            });
        });
    });

    // test suites will begin here

    describe("#create()", () => {

        it("should create an upvote on a post for a user", (done) => {
            Vote.create({
                value: 1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                expect(vote.value).toBe(1);
                expect(vote.postId).toBe(this.post.id);
                expect(vote.userId).toBe(this.user.id);
                
                done();
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });

        it("should create a downvote on a post for a user", (done) => {
            Vote.create({
                value: -1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                expect(vote.value).toBe(-1);
                expect(vote.postId).toBe(this.post.id);
                expect(vote.userId).toBe(this.user.id);
                
                done();
    
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });

        it("should not create a vote with a value that is not 1 or -1", (done) => {
            Vote.create({
                value: 2,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
            })
            .catch((err) => {
                expect(err.message).toContain("Validation isIn on value failed");
                done();
            });
        });

    });

    describe("#getUser()", () => {

        it("should return the associated user", (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                vote.getUser()
                .then((user) => {
                    expect(user.id).toBe(this.user.id); // ensure the right user is returned
                    
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });
    });

    describe("#setPost()", () => {

        it("should associate a post and a vote together", (done) => {
   
            Vote.create({           // create a vote on `this.post`
                value: -1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                this.vote = vote;     // store it

                Post.create({         // create a new post
                    title: "Dress code on Proxima b",
                    body: "Spacesuit, space helmet, space boots, and space gloves",
                    topicId: this.topic.id,
                    userId: this.user.id
                })
                .then((newPost) => {

                    expect(this.vote.postId).toBe(this.post.id); // check vote not associated with newPost

                    this.vote.setPost(newPost)              // update post reference for vote
                    .then((vote) => {

                        expect(vote.postId).toBe(newPost.id); // ensure it was updated
                        
                        done();

                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
   
    });

    describe("#getPost()", () => {

        it("should return the associated post", (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                this.comment.getPost()
                .then((associatedPost) => {
                    expect(associatedPost.title).toBe("My first visit to Proxima Centauri b");
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
   
    });


    
    // START UPVOTE CONTEXT
    describe("#hasUpvoteFor()", () => {

        it("should return true if the user with the matching userId has an upvote for a given post", done => {
            Vote.create({
                value: 1,
                postId: this.post.id,
                userId: this.user.id,
            }).then(vote => {
                this.vote = vote;
                 Post.create({
                    title: "Testing hasUpvoteFor",
                    body: "Writing tests is my favorite",
                    topicId: this.topic.id,
                    userId: this.user.id,
                }).then(newPost => {
                    expect(this.vote.postId).not.toBe(newPost.id);
                     this.vote.setPost(newPost).then(vote => {
                        expect(vote.postId).toBe(newPost.id);
                        expect(this.vote.userId).toBe(newPost.userId);
                        newPost.hasUpvoteFor(newPost.userId).then(votes => {
                            expect(votes.length > 0).toBe(true);
                            
                            done();
                        });
                    });
                });
            });
        });

    });
    // END UPVOTE CONTEXT



    // START DOWNVOTE CONTEXT
    describe("#hasDownvoteFor()", () => { //start of hasDownvoteFor
        
        it("should return true if the user with the matching userId has a downvote for a given post", done => {
            Vote.create({
                value: -1,
                postId: this.post.id,
                userId: this.user.id,
            }).then(vote => {
                this.vote = vote;
                 Post.create({
                    title: "Testing hasDownvoteFor",
                    body: 'Do not let me down hasDownvoteFor test',
                    topicId: this.topic.id,
                    userId: this.user.id,
                }).then(newPost => {
                    expect(this.vote.postId).not.toBe(newPost.id);
                     this.vote.setPost(newPost).then(vote => {
                        expect(vote.postId).toBe(newPost.id);
                        expect(this.vote.userId).toBe(newPost.userId);
                        newPost.hasDownvoteFor(newPost.userId).then(votes => {
                            expect(votes.length > 0).toBe(true);
                            
                            done();
                        });
                    });
                });
            });
        });

    });
    // END DOWNVOTE CONTEXT
 


});